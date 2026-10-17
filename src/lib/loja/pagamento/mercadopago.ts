/**
 * Mercado Pago (Pix e cartão) atrás da interface do gateway (plano §4.7).
 *
 * - Pix: pagamento direto (POST /v1/payments), `X-Idempotency-Key` = id do pedido.
 * - Cartão: Checkout Pro (POST /checkout/preferences); o cliente paga na página do Mercado Pago.
 *   Enquanto não há pagamento, a referência é `pedido:<id>`; depois vira o id do pagamento.
 * - Aviso (webhook): assinatura `x-signature` conferida com o segredo; o aviso só traz o id do
 *   pagamento, então o estado vem de uma consulta à API (nunca se acredita no corpo do aviso).
 * - Só vale pagamento cujo `external_reference` é um id de pedido nosso (a conta pode ter outros usos).
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import type {
  Cobranca,
  EntradaDeCobranca,
  EventoDoGateway,
  GatewayDePagamento,
  StatusNoGateway,
} from './gateway'

const API = 'https://api.mercadopago.com'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const PREFIXO_CARTAO = 'pedido:'

export interface ConfigMercadoPago {
  accessToken: string
  /** Segredo do webhook (painel do Mercado Pago > Webhooks). */
  segredoWebhook: string
  /** Endereço público do site (https://...), sem barra no fim. Usado no aviso e nos retornos. */
  urlBase: string
  fetch?: typeof fetch
}

export class ErroMercadoPago extends Error {
  constructor(
    readonly status: number,
    readonly detalhe: string,
  ) {
    super(`Mercado Pago respondeu ${status}`)
  }
}

export function mapearStatus(status: string | undefined): StatusNoGateway {
  switch (status) {
    case 'approved':
      return 'aprovado'
    case 'rejected':
      return 'recusado'
    case 'cancelled':
      return 'cancelado'
    case 'refunded':
    case 'charged_back':
      return 'reembolsado'
    default: // pending, in_process, in_mediation, authorized
      return 'pendente'
  }
}

function separarNome(nome: string): { primeiro: string; resto: string } {
  const partes = nome.trim().split(/\s+/)
  return { primeiro: partes[0] ?? '', resto: partes.slice(1).join(' ') }
}

const arredondar = (v: number) => Math.round(v * 100) / 100

export class GatewayMercadoPago implements GatewayDePagamento {
  readonly nome = 'mercadopago'
  private readonly chamar: typeof fetch

  constructor(private readonly cfg: ConfigMercadoPago) {
    this.chamar = cfg.fetch ?? fetch
  }

  private async api<T>(caminho: string, opcoes: { metodo?: 'GET' | 'POST'; corpo?: unknown; idempotencia?: string } = {}): Promise<T> {
    const resposta = await this.chamar(`${API}${caminho}`, {
      method: opcoes.metodo ?? 'GET',
      headers: {
        Authorization: `Bearer ${this.cfg.accessToken}`,
        'Content-Type': 'application/json',
        ...(opcoes.idempotencia ? { 'X-Idempotency-Key': opcoes.idempotencia } : {}),
      },
      body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
      signal: AbortSignal.timeout(20_000),
    })
    const texto = await resposta.text()
    if (!resposta.ok) throw new ErroMercadoPago(resposta.status, texto.slice(0, 500))
    return (texto ? JSON.parse(texto) : {}) as T
  }

  async criarCobranca(e: EntradaDeCobranca): Promise<Cobranca> {
    const valor = arredondar(e.valor)
    const aviso = `${this.cfg.urlBase}/api/loja/webhook/mercadopago`
    const { primeiro, resto } = separarNome(e.pagador.nome)
    const cpf = e.pagador.cpf?.replace(/\D/g, '')

    if (e.meio === 'pix') {
      // O Mercado Pago exige pelo menos ~30 min de validade no Pix; pagar depois do prazo do pedido é honrado.
      const minimo = Date.now() + 35 * 60_000
      const validade = new Date(Math.max(e.expiraEm?.getTime() ?? 0, minimo))
      const p = await this.api<{
        id: number
        status: string
        point_of_interaction?: { transaction_data?: { qr_code?: string } }
      }>('/v1/payments', {
        metodo: 'POST',
        idempotencia: `pix-${e.pedidoId}`,
        corpo: {
          transaction_amount: valor,
          description: e.descricao,
          payment_method_id: 'pix',
          external_reference: e.pedidoId,
          notification_url: aviso,
          date_of_expiration: validade.toISOString().replace('Z', '+00:00'),
          payer: {
            email: e.pagador.email,
            first_name: primeiro,
            last_name: resto || undefined,
            ...(cpf && cpf.length === 11 ? { identification: { type: 'CPF', number: cpf } } : {}),
          },
        },
      })
      const copiaECola = p.point_of_interaction?.transaction_data?.qr_code
      if (!copiaECola) throw new ErroMercadoPago(502, 'resposta do Pix sem qr_code')
      return { gatewayRef: String(p.id), status: mapearStatus(p.status), pix: { copiaECola } }
    }

    const retorno = `${this.cfg.urlBase}/checkout/${e.pedidoId}`
    const pref = await this.api<{ id: string; init_point?: string; sandbox_init_point?: string }>('/checkout/preferences', {
      metodo: 'POST',
      idempotencia: `cartao-${e.pedidoId}`,
      corpo: {
        items: [{ id: e.pedidoId, title: e.descricao, quantity: 1, unit_price: valor, currency_id: 'BRL' }],
        payer: { email: e.pagador.email, name: primeiro, surname: resto || undefined },
        external_reference: e.pedidoId,
        notification_url: aviso,
        back_urls: { success: retorno, pending: retorno, failure: retorno },
        auto_return: 'approved',
        statement_descriptor: 'AGUA VERDE',
        payment_methods: { excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }] },
      },
    })
    const url = this.cfg.accessToken.startsWith('TEST-') ? (pref.sandbox_init_point ?? pref.init_point) : pref.init_point
    if (!url) throw new ErroMercadoPago(502, 'preferência sem init_point')
    return { gatewayRef: `${PREFIXO_CARTAO}${e.pedidoId}`, status: 'pendente', urlDePagamento: url }
  }

  async consultarPagamento(gatewayRef: string): Promise<{ status: StatusNoGateway; valor?: number; gatewayRef?: string }> {
    if (gatewayRef.startsWith(PREFIXO_CARTAO)) {
      const pedidoId = gatewayRef.slice(PREFIXO_CARTAO.length)
      if (!UUID.test(pedidoId)) return { status: 'pendente' }
      const r = await this.api<{ results?: { id: number; status: string; transaction_amount: number }[] }>(
        `/v1/payments/search?external_reference=${encodeURIComponent(pedidoId)}&sort=date_created&criteria=desc`,
      )
      const aprovado = r.results?.find((p) => p.status === 'approved')
      return aprovado
        ? { status: 'aprovado', valor: aprovado.transaction_amount, gatewayRef: String(aprovado.id) }
        : { status: 'pendente' }
    }
    if (!/^\d+$/.test(gatewayRef)) return { status: 'pendente' }
    const p = await this.api<{ status: string; transaction_amount?: number }>(`/v1/payments/${gatewayRef}`)
    return { status: mapearStatus(p.status), valor: p.transaction_amount }
  }

  async reembolsar(gatewayRef: string, valor?: number): Promise<{ ok: boolean; reembolsoRef?: string }> {
    if (!/^\d+$/.test(gatewayRef)) return { ok: false } // cartão ainda sem pagamento: nada a reembolsar
    try {
      const r = await this.api<{ id?: number }>(`/v1/payments/${gatewayRef}/refunds`, {
        metodo: 'POST',
        idempotencia: `reembolso-${gatewayRef}-${valor === undefined ? 'total' : arredondar(valor)}`,
        corpo: valor === undefined ? {} : { amount: arredondar(valor) },
      })
      return { ok: true, reembolsoRef: r.id === undefined ? undefined : String(r.id) }
    } catch (erro) {
      if (erro instanceof ErroMercadoPago && erro.status >= 400 && erro.status < 500) return { ok: false }
      throw erro
    }
  }

  async validarWebhook(
    corpoCru: string,
    cabecalhos: { get(nome: string): string | null },
    url?: URL,
  ): Promise<EventoDoGateway | 'ignorar' | null> {
    let corpo: { type?: string; topic?: string; data?: { id?: string | number } }
    try {
      corpo = JSON.parse(corpoCru)
    } catch {
      return null
    }
    const idNoAviso = url?.searchParams.get('data.id') ?? (corpo.data?.id === undefined ? null : String(corpo.data.id))
    if (!this.assinaturaConfere(cabecalhos, idNoAviso)) return null

    const tipo = corpo.type ?? corpo.topic
    if (tipo !== 'payment' || !idNoAviso || !/^\d+$/.test(idNoAviso)) return 'ignorar'

    let p: { id: number; status: string; external_reference?: string; transaction_amount?: number }
    try {
      p = await this.api(`/v1/payments/${idNoAviso}`)
    } catch (erro) {
      if (erro instanceof ErroMercadoPago && erro.status === 404) return 'ignorar' // ex.: aviso de teste do painel
      throw erro // 5xx/rede: o Mercado Pago tenta de novo
    }
    if (!p.external_reference || !UUID.test(p.external_reference)) return 'ignorar' // pagamento que não é de pedido da loja

    const status = mapearStatus(p.status)
    return {
      eventoId: `mp_${p.id}_${p.status}`,
      gatewayRef: String(p.id),
      pedidoId: p.external_reference.toLowerCase(),
      status,
      valor: p.transaction_amount,
    }
  }

  /** x-signature: "ts=...,v1=..."; manifesto "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" (campos ausentes saem). */
  private assinaturaConfere(cabecalhos: { get(nome: string): string | null }, dataId: string | null): boolean {
    const assinatura = cabecalhos.get('x-signature')
    if (!assinatura) return false
    const partes = Object.fromEntries(
      assinatura.split(',').map((p) => {
        const i = p.indexOf('=')
        return [p.slice(0, i).trim(), p.slice(i + 1).trim()]
      }),
    ) as Record<string, string>
    if (!partes.ts || !partes.v1 || !/^[0-9a-f]{64}$/i.test(partes.v1)) return false

    const requestId = cabecalhos.get('x-request-id')
    const id = dataId && /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId
    const manifesto = `${id ? `id:${id};` : ''}${requestId ? `request-id:${requestId};` : ''}ts:${partes.ts};`
    const esperada = createHmac('sha256', this.cfg.segredoWebhook).update(manifesto).digest()
    const recebida = Buffer.from(partes.v1, 'hex')
    return esperada.length === recebida.length && timingSafeEqual(esperada, recebida)
  }
}

/** Só para os testes: gera o cabeçalho que o Mercado Pago mandaria. */
export function assinaturaDeTeste(segredo: string, dataId: string, requestId: string, ts = '1700000000'): string {
  const manifesto = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`
  return `ts=${ts},v1=${createHmac('sha256', segredo).update(manifesto).digest('hex')}`
}
