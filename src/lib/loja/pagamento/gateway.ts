/**
 * Interface do meio de pagamento (plano §4.7, item 7).
 *
 * O checkout só conhece esta interface. Hoje existe só a implementação
 * simulada; no Prompt C entra o Mercado Pago, e trocar por Stripe ou Asaas
 * depois não mexe no checkout.
 */

export type MeioDePagamento = 'pix' | 'cartao'

export type StatusNoGateway = 'pendente' | 'aprovado' | 'recusado' | 'cancelado' | 'reembolsado'

export interface EntradaDeCobranca {
  /** Id do pedido: é a chave de idempotência enviada ao gateway (§4.7, item 1). */
  pedidoId: string
  /** Sempre em reais (decisão 24). */
  valor: number
  meio: MeioDePagamento
  descricao: string
  pagador: { nome: string; email: string; telefone: string; cpf?: string }
}

export interface Cobranca {
  gatewayRef: string
  status: StatusNoGateway
  /** Pix: código "copia e cola". */
  pix?: { copiaECola: string }
  /** Cartão: página do gateway onde o cliente paga. */
  urlDePagamento?: string
}

/** Aviso do gateway, já verificado (assinatura conferida no corpo cru da requisição). */
export interface EventoDoGateway {
  /** Identificador único do evento; duplicatas são ignoradas (§4.7, item 3). */
  eventoId: string
  gatewayRef: string
  pedidoId: string
  status: StatusNoGateway
  valor?: number
}

export interface GatewayDePagamento {
  readonly nome: string
  criarCobranca(entrada: EntradaDeCobranca): Promise<Cobranca>
  consultarPagamento(gatewayRef: string): Promise<{ status: StatusNoGateway; valor?: number }>
  reembolsar(gatewayRef: string, valor?: number): Promise<{ ok: boolean; reembolsoRef?: string }>
  /**
   * Confere a assinatura usando o corpo CRU (texto, sem ter passado por JSON.parse)
   * e devolve o evento. Devolve null se a assinatura não bater ou o corpo for inválido.
   */
  validarWebhook(corpoCru: string, cabecalhos: { get(nome: string): string | null }): EventoDoGateway | null
}
