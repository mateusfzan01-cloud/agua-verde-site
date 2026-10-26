/**
 * Woovi (Pix) atrás da interface do gateway (plano §4.7; decisão 31: Pix na Woovi, cartão na Stripe).
 *
 * - Cobrança: POST /api/v1/charge?return_existing=true com `correlationID` = id do pedido; repetir a
 *   chamada devolve a cobrança que já existe (idempotência). Valor em centavos.
 * - Consulta: GET /api/v1/charge/{correlationID}; estados ACTIVE, COMPLETED e EXPIRED.
 * - Aviso (webhook): cabeçalho `x-webhook-signature` = RSA-SHA256, em base64, do corpo CRU, com a chave
 *   pública da Woovi (GET /api/v1/webhook/public-keys). Vale qualquer chave da lista (na troca de chave a
 *   Woovi publica a velha e a nova), guardadas por 1 hora. Como a assinatura cobre o corpo inteiro, o
 *   estado do pagamento vem do próprio aviso.
 * - Só cobra Pix. Reembolso de Pix é manual pelo painel da Woovi (decisão 33): `reembolsar` não chama a API.
 * - Só vale cobrança cujo correlationID é um id de pedido nosso (a conta pode ter outros usos).
 *
 * Fontes (2026-10-26): developers.woovi.com (criar cobrança, eventos do webhook, validação da assinatura,
 * chaves públicas) e a referência da API em developers.openpix.com.br/en/api.
 */
import { createVerify } from 'node:crypto'
import type {
  Cobranca,
  EntradaDeCobranca,
  EventoDoGateway,
  GatewayDePagamento,
  StatusNoGateway,
} from './gateway'

export const HOST_SANDBOX = 'https://api.woovi-sandbox.com'
export const HOST_PRODUCAO = 'https://api.woovi.com'
export const CABECALHO_ASSINATURA = 'x-webhook-signature'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** A Woovi não aceita cobrança que vença em menos de 5 minutos. */
const VALIDADE_MINIMA_S = 5 * 60
/** Validade quando o pedido não diz até quando vale (o pedido da loja vence em 30 minutos). */
const VALIDADE_PADRAO_S = 30 * 60
/** A resposta das chaves públicas vem com Cache-Control max-age=3600. */
const CACHE_CHAVES_MS = 60 * 60_000
/** Assinatura que não bate com as chaves guardadas força nova busca, mas no máximo uma vez a cada 5 minutos. */
const INTERVALO_MINIMO_RECARGA_MS = 5 * 60_000
/** O Pix leva o comentário no campo "infoPagador", limitado a 140 caracteres. */
const LIMITE_COMENTARIO = 140

const EVENTOS_PAGO = new Set(['OPENPIX:CHARGE_COMPLETED', 'OPENPIX:CHARGE_COMPLETED_NOT_SAME_CUSTOMER_PAYER'])
const EVENTO_EXPIRADO = 'OPENPIX:CHARGE_EXPIRED'

export interface ConfigWoovi {
  /** AppID da aplicação no painel da Woovi (vai direto no cabeçalho Authorization). */
  appId: string
  /** Endereço da API, sem barra no fim. Padrão: sandbox. Produção: `HOST_PRODUCAO`. */
  urlApi?: string
  fetch?: typeof fetch
  /** Relógio (milissegundos), para os testes. */
  agora?: () => number
}

export class ErroWoovi extends Error {
  constructor(
    readonly status: number,
    readonly detalhe: string,
  ) {
    super(`Woovi respondeu ${status}`)
  }
}

export function mapearStatus(status: string | undefined): StatusNoGateway {
  switch (status) {
    case 'COMPLETED':
      return 'aprovado'
    case 'EXPIRED':
      return 'cancelado'
    default: // ACTIVE
      return 'pendente'
  }
}

/** Reais para centavos, sem o erro de ponto flutuante (212,35 × 100 = 21235,000000000004). */
export function centavos(valor: number): number {
  return Math.round(valor * 100)
}

interface CobrancaWoovi {
  correlationID?: string
  value?: number
  status?: string
  brCode?: string
}

/** A chave pode vir em PEM ou em base64 do PEM (o exemplo da documentação usa a segunda forma). */
function paraPem(chave: string): string {
  return chave.includes('BEGIN') ? chave : Buffer.from(chave, 'base64').toString('utf8')
}

function assinaturaConfere(corpoCru: string, assinatura: string, chaves: string[]): boolean {
  return chaves.some((chave) => {
    try {
      return createVerify('sha256').update(corpoCru).verify(paraPem(chave), assinatura, 'base64')
    } catch {
      return false // chave em formato que não dá para ler: tenta a próxima
    }
  })
}

export class GatewayWoovi implements GatewayDePagamento {
  readonly nome = 'woovi'
  private readonly chamar: typeof fetch
  private readonly agora: () => number
  private readonly urlApi: string
  private chaves?: { lista: string[]; buscadasEm: number }

  constructor(private readonly cfg: ConfigWoovi) {
    this.chamar = cfg.fetch ?? fetch
    this.agora = cfg.agora ?? Date.now
    this.urlApi = (cfg.urlApi ?? HOST_SANDBOX).replace(/\/$/, '')
    if (!this.urlApi.startsWith('https://')) throw new Error('WOOVI_API_URL precisa começar com https://')
  }

  private async api<T>(caminho: string, opcoes: { metodo?: 'GET' | 'POST'; corpo?: unknown } = {}): Promise<T> {
    const resposta = await this.chamar(`${this.urlApi}${caminho}`, {
      method: opcoes.metodo ?? 'GET',
      headers: { Authorization: this.cfg.appId, 'Content-Type': 'application/json' },
      body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
      signal: AbortSignal.timeout(20_000),
    })
    const texto = await resposta.text()
    if (!resposta.ok) throw new ErroWoovi(resposta.status, texto.slice(0, 500))
    return (texto ? JSON.parse(texto) : {}) as T
  }

  async criarCobranca(e: EntradaDeCobranca): Promise<Cobranca> {
    if (e.meio !== 'pix') throw new Error('A Woovi só cobra Pix (decisão 31: cartão na Stripe)')
    const restante = e.expiraEm ? Math.ceil((e.expiraEm.getTime() - this.agora()) / 1000) : VALIDADE_PADRAO_S
    const cpf = e.pagador.cpf?.replace(/\D/g, '')

    const r = await this.api<{ charge?: CobrancaWoovi; brCode?: string; correlationID?: string }>('/api/v1/charge?return_existing=true', {
      metodo: 'POST',
      corpo: {
        correlationID: e.pedidoId,
        value: centavos(e.valor),
        comment: e.descricao.slice(0, LIMITE_COMENTARIO),
        expiresIn: Math.max(restante, VALIDADE_MINIMA_S),
        customer: {
          name: e.pagador.nome,
          email: e.pagador.email,
          ...(cpf && cpf.length === 11 ? { taxID: cpf } : {}),
        },
      },
    })
    const copiaECola = r.charge?.brCode ?? r.brCode
    if (!copiaECola) throw new ErroWoovi(502, 'resposta da cobrança sem brCode')
    return {
      gatewayRef: r.charge?.correlationID ?? r.correlationID ?? e.pedidoId,
      status: mapearStatus(r.charge?.status),
      pix: { copiaECola },
    }
  }

  async consultarPagamento(gatewayRef: string): Promise<{ status: StatusNoGateway; valor?: number }> {
    if (!UUID.test(gatewayRef)) return { status: 'pendente' } // nem chama a API com referência que não é nossa
    try {
      const r = await this.api<{ charge?: CobrancaWoovi }>(`/api/v1/charge/${encodeURIComponent(gatewayRef)}`)
      const valor = typeof r.charge?.value === 'number' ? r.charge.value / 100 : undefined
      return { status: mapearStatus(r.charge?.status), valor }
    } catch (erro) {
      if (erro instanceof ErroWoovi && erro.status === 404) return { status: 'pendente' }
      throw erro
    }
  }

  /** Reembolso de Pix é manual, pelo painel da Woovi (decisão 33). Nunca chama a API daqui. */
  async reembolsar(): Promise<{ ok: boolean; reembolsoRef?: string }> {
    return { ok: false }
  }

  /**
   * Chaves públicas da Woovi, guardadas por 1 hora. Se a busca falhar e houver chaves guardadas, segue com
   * elas (orientação da Woovi); sem nenhuma, o erro sobe e a rota responde 500 para a Woovi tentar de novo.
   */
  private async chavesPublicas(forcar = false): Promise<string[]> {
    const agora = this.agora()
    if (this.chaves && !forcar && agora - this.chaves.buscadasEm < CACHE_CHAVES_MS) return this.chaves.lista
    try {
      const resposta = await this.chamar(`${this.urlApi}/api/v1/webhook/public-keys`, { signal: AbortSignal.timeout(10_000) })
      if (!resposta.ok) throw new ErroWoovi(resposta.status, 'falha ao buscar as chaves públicas')
      const corpo = (await resposta.json()) as { public_keys?: { key?: unknown }[] }
      const lista = (corpo.public_keys ?? []).map((k) => k.key).filter((k): k is string => typeof k === 'string' && k.length > 0)
      if (lista.length === 0) throw new ErroWoovi(502, 'lista de chaves públicas vazia')
      this.chaves = { lista, buscadasEm: agora }
      return lista
    } catch (erro) {
      if (this.chaves) return this.chaves.lista
      throw erro
    }
  }

  async validarWebhook(corpoCru: string, cabecalhos: { get(nome: string): string | null }): Promise<EventoDoGateway | 'ignorar' | null> {
    const assinatura = cabecalhos.get(CABECALHO_ASSINATURA)
    if (!assinatura) return null

    let confere = assinaturaConfere(corpoCru, assinatura, await this.chavesPublicas())
    // Chave nova (troca na Woovi) ainda não guardada: busca de novo, sem martelar a API.
    if (!confere && this.chaves && this.agora() - this.chaves.buscadasEm >= INTERVALO_MINIMO_RECARGA_MS) {
      confere = assinaturaConfere(corpoCru, assinatura, await this.chavesPublicas(true))
    }
    if (!confere) return null

    let corpo: { event?: string; charge?: CobrancaWoovi }
    try {
      corpo = JSON.parse(corpoCru)
    } catch {
      return null
    }
    const evento = corpo.event ?? ''
    const pago = EVENTOS_PAGO.has(evento)
    // Outros eventos (cobrança criada, reembolso, disputa, teste do painel) não mexem no pedido.
    if (!pago && evento !== EVENTO_EXPIRADO) return 'ignorar'

    const correlationID = corpo.charge?.correlationID
    if (!correlationID || !UUID.test(correlationID)) return 'ignorar' // cobrança que não é de pedido da loja

    return {
      gateway: this.nome,
      eventoId: `woovi_${correlationID}_${evento}`,
      gatewayRef: correlationID,
      pedidoId: correlationID.toLowerCase(),
      status: pago ? 'aprovado' : 'cancelado',
      valor: typeof corpo.charge?.value === 'number' ? corpo.charge.value / 100 : undefined,
    }
  }
}
