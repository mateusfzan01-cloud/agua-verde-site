/**
 * Stripe (cartão) atrás da interface do gateway (plano de pagamento, etapa B3; decisões 31 e D14).
 *
 * - Cobrança: Checkout Session HOSPEDADA pela Stripe (o cliente digita o cartão na página da Stripe):
 *   `mode=payment`, só cartão, idioma do pedido, botão "Reservar" (`submit_type=book`),
 *   `client_reference_id` = id do pedido, valor em centavos de real.
 * - Referência: enquanto não há pagamento, é o id da sessão (`cs_...`); depois de pago, vira o id do
 *   pagamento (`pi_...`), que é o que o reembolso usa. As duas formas são aceitas em consulta e reembolso.
 * - Aviso (webhook): assinatura `stripe-signature` conferida pela biblioteca oficial com o segredo do
 *   endpoint (`whsec_...`) sobre o corpo CRU, com tolerância de 5 minutos contra reenvio de aviso velho.
 *   Esse segredo é exclusivo do endpoint cadastrado na conta da loja: um aviso assinado com ele só pode
 *   ter vindo da nossa conta (diferente da Woovi, cuja chave é a mesma para todas as contas).
 * - Só vale sessão cujo `client_reference_id` é um id de pedido nosso e cuja moeda é o real.
 * - Pagamento que cai depois do prazo do pedido continua honrado (o fluxo confirma pedido expirado).
 *
 * Fontes (2026-10-29): docs.stripe.com (Checkout Sessions, Refunds, Webhooks/assinatura, idempotência)
 * e os tipos da biblioteca `stripe` 22.6.2.
 */
import Stripe from 'stripe'
import type {
  Cobranca,
  EntradaDeCobranca,
  EventoDoGateway,
  GatewayDePagamento,
  StatusNoGateway,
} from './gateway'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const CABECALHO_ASSINATURA = 'stripe-signature'

/** A Stripe exige que a sessão valha de 30 minutos a 24 horas; folga de 1 minuto para o tempo da chamada. */
const VALIDADE_MINIMA_MS = 31 * 60_000
const VALIDADE_MAXIMA_MS = 23 * 60 * 60_000

const EVENTOS_PAGO = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded'])
const EVENTO_FALHOU = 'checkout.session.async_payment_failed'

const LOCALE: Record<'pt' | 'es' | 'en', Stripe.Checkout.SessionCreateParams.Locale> = { pt: 'pt-BR', es: 'es', en: 'en' }

export interface ConfigStripe {
  /** Chave SECRETA (`sk_test_...` no sandbox, `sk_live_...` em produção). Nunca a publicável (`pk_`). */
  chaveSecreta: string
  /** Segredo do endpoint de webhook (`whsec_...`), mostrado pela Stripe ao cadastrar o endpoint. */
  segredoWebhook: string
  /** Endereço público do site (https://...), sem barra no fim. Usado no retorno do cliente. */
  urlBase: string
  /** Só para testes: troca a rede por um fetch controlado. */
  fetch?: typeof fetch
  agora?: () => number
}

/** Reais para centavos, sem erro de ponto flutuante (R$ 212,35 = 21235). */
export const centavos = (valor: number) => Math.round(valor * 100)

export function mapearStatusDaSessao(s: Pick<Stripe.Checkout.Session, 'status' | 'payment_status'>): StatusNoGateway {
  if (s.payment_status === 'paid') return 'aprovado'
  if (s.status === 'expired') return 'cancelado'
  return 'pendente'
}

export function mapearStatusDoPagamento(status: Stripe.PaymentIntent.Status | undefined): StatusNoGateway {
  if (status === 'succeeded') return 'aprovado'
  if (status === 'canceled') return 'cancelado'
  return 'pendente'
}

const idDe = (x: string | { id: string } | null | undefined) => (typeof x === 'string' ? x : x?.id)

/** Recurso que não existe na conta (ex.: referência de outra conta ou apagada). */
const naoExiste = (erro: unknown) => erro instanceof Stripe.errors.StripeError && erro.statusCode === 404

export class GatewayStripe implements GatewayDePagamento {
  readonly nome = 'stripe'
  private readonly stripe: Stripe
  private readonly agora: () => number

  constructor(private readonly cfg: ConfigStripe) {
    const chave = cfg.chaveSecreta.trim()
    if (chave.startsWith('pk_')) {
      throw new Error('STRIPE_SECRET_KEY recebeu a chave publicável (pk_...): use a chave secreta (sk_...) do mesmo ambiente')
    }
    if (!/^(sk|rk)_(test|live)_/.test(chave)) throw new Error('STRIPE_SECRET_KEY precisa começar com sk_test_ ou sk_live_')
    if (!cfg.segredoWebhook.startsWith('whsec_')) throw new Error('STRIPE_WEBHOOK_SECRET precisa começar com whsec_')
    if (!cfg.urlBase.startsWith('https://')) throw new Error('LOJA_URL_BASE precisa começar com https:// (a Stripe devolve o cliente para lá)')
    this.stripe = new Stripe(chave, {
      maxNetworkRetries: cfg.fetch ? 0 : 2,
      timeout: 20_000,
      ...(cfg.fetch ? { httpClient: Stripe.createFetchHttpClient(cfg.fetch) } : {}),
    })
    this.agora = cfg.agora ?? Date.now
  }

  async criarCobranca(e: EntradaDeCobranca): Promise<Cobranca> {
    if (e.meio !== 'cartao') throw new Error('A Stripe só cobra cartão nesta loja (decisão 31: Pix na Woovi)')
    const agora = this.agora()
    // Prazo do pedido, respeitando o mínimo e o máximo da Stripe. Arredondado para o minuto seguinte para
    // que um segundo clique no mesmo minuto repita os mesmos parâmetros e reaproveite a mesma sessão.
    const minimo = Math.ceil((agora + VALIDADE_MINIMA_MS) / 60_000) * 60
    const expiraEm = Math.min(Math.max(Math.ceil((e.expiraEm?.getTime() ?? 0) / 1000), minimo), Math.floor((agora + VALIDADE_MAXIMA_MS) / 1000))
    const idioma = e.idioma ?? 'pt'
    const retorno = `${this.cfg.urlBase}${idioma === 'pt' ? '' : `/${idioma}`}/checkout/${e.pedidoId}`

    const sessao = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        payment_method_types: ['card'],
        locale: LOCALE[idioma],
        submit_type: 'book',
        client_reference_id: e.pedidoId,
        customer_email: e.pagador.email,
        expires_at: expiraEm,
        line_items: [
          { quantity: 1, price_data: { currency: 'brl', unit_amount: centavos(e.valor), product_data: { name: e.descricao } } },
        ],
        metadata: { pedido_id: e.pedidoId },
        payment_intent_data: { description: e.descricao, metadata: { pedido_id: e.pedidoId } },
        success_url: retorno,
        cancel_url: retorno,
      },
      // A Stripe recusa a mesma chave com parâmetros diferentes, então o prazo entra na chave.
      { idempotencyKey: `checkout-${e.pedidoId}-${expiraEm}` },
    )
    if (!sessao.url) throw new Error('A Stripe devolveu a sessão sem o endereço de pagamento')
    return { gatewayRef: sessao.id, status: mapearStatusDaSessao(sessao), urlDePagamento: sessao.url }
  }

  async consultarPagamento(gatewayRef: string): Promise<{ status: StatusNoGateway; valor?: number; gatewayRef?: string }> {
    try {
      if (gatewayRef.startsWith('cs_')) {
        const s = await this.stripe.checkout.sessions.retrieve(gatewayRef)
        const status = mapearStatusDaSessao(s)
        if (status !== 'aprovado') return { status }
        if (s.currency !== 'brl') return { status: 'pendente' }
        return {
          status,
          valor: typeof s.amount_total === 'number' ? s.amount_total / 100 : undefined,
          gatewayRef: idDe(s.payment_intent) ?? gatewayRef,
        }
      }
      if (gatewayRef.startsWith('pi_')) {
        const p = await this.stripe.paymentIntents.retrieve(gatewayRef)
        const status = mapearStatusDoPagamento(p.status)
        return status === 'aprovado' && p.currency === 'brl' ? { status, valor: p.amount_received / 100 } : { status: status === 'aprovado' ? 'pendente' : status }
      }
    } catch (erro) {
      if (naoExiste(erro)) return { status: 'pendente' }
      throw erro
    }
    return { status: 'pendente' } // referência que não é da Stripe: nem chama a API
  }

  /** Reembolso total (ou do valor dado) pelo pagamento. Repetir não devolve duas vezes (idempotência). */
  async reembolsar(gatewayRef: string, valor?: number): Promise<{ ok: boolean; reembolsoRef?: string }> {
    try {
      let pagamento: string | undefined = gatewayRef
      if (gatewayRef.startsWith('cs_')) pagamento = idDe((await this.stripe.checkout.sessions.retrieve(gatewayRef)).payment_intent)
      if (!pagamento?.startsWith('pi_')) return { ok: false } // sessão sem pagamento: nada a devolver

      const r = await this.stripe.refunds.create(
        { payment_intent: pagamento, ...(valor === undefined ? {} : { amount: centavos(valor) }) },
        { idempotencyKey: `reembolso-${pagamento}-${valor === undefined ? 'total' : centavos(valor)}` },
      )
      return r.status === 'failed' || r.status === 'canceled' ? { ok: false } : { ok: true, reembolsoRef: r.id }
    } catch (erro) {
      if (erro instanceof Stripe.errors.StripeError) {
        if (erro.code === 'charge_already_refunded') return { ok: true }
        if (erro.statusCode !== undefined && erro.statusCode >= 400 && erro.statusCode < 500) return { ok: false }
      }
      throw erro // 5xx/rede: quem chamou tenta de novo
    }
  }

  async validarWebhook(corpoCru: string, cabecalhos: { get(nome: string): string | null }): Promise<EventoDoGateway | 'ignorar' | null> {
    const assinatura = cabecalhos.get(CABECALHO_ASSINATURA)
    if (!assinatura) return null
    let evento: Stripe.Event
    try {
      evento = this.stripe.webhooks.constructEvent(corpoCru, assinatura, this.cfg.segredoWebhook)
    } catch {
      return null // assinatura errada, aviso velho (mais de 5 minutos) ou corpo que não é JSON
    }

    const pago = EVENTOS_PAGO.has(evento.type)
    if (!pago && evento.type !== EVENTO_FALHOU) return 'ignorar'
    const sessao = evento.data.object as Stripe.Checkout.Session
    const pedidoId = sessao.client_reference_id
    if (!pedidoId || !UUID.test(pedidoId)) return 'ignorar' // sessão que não é de pedido da loja
    if (sessao.currency !== 'brl') return 'ignorar'
    // "completed" de um meio assíncrono chega antes do dinheiro; o aviso que vale é o "async_payment_succeeded".
    if (pago && sessao.payment_status !== 'paid') return 'ignorar'

    return {
      gateway: this.nome,
      eventoId: evento.id,
      gatewayRef: idDe(sessao.payment_intent) ?? sessao.id,
      pedidoId: pedidoId.toLowerCase(),
      status: pago ? 'aprovado' : 'recusado',
      valor: typeof sessao.amount_total === 'number' ? sessao.amount_total / 100 : undefined,
    }
  }
}
