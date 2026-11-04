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
  /** Até quando o Pix vale (o gateway pode exigir um mínimo; o pedido pago depois do prazo é honrado). */
  expiraEm?: Date
  /** Idioma do pedido: a página de pagamento hospedada (cartão) abre nele e o cliente volta para ele. */
  idioma?: 'pt' | 'es' | 'en'
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
  /**
   * Nome do provedor que mandou o aviso (`GatewayDePagamento.nome`). Com dois provedores
   * (decisão 31: cartão na Stripe, Pix na Woovi) os ids de evento são independentes e podem
   * coincidir, então a duplicata é reconhecida pelo par (gateway, eventoId).
   */
  gateway: string
  /** Identificador único do evento dentro do provedor; duplicatas são ignoradas (§4.7, item 3). */
  eventoId: string
  gatewayRef: string
  pedidoId: string
  status: StatusNoGateway
  valor?: number
}

export interface GatewayDePagamento {
  readonly nome: string
  criarCobranca(entrada: EntradaDeCobranca): Promise<Cobranca>
  /** Pode devolver `gatewayRef` novo (ex.: cartão: da referência do pedido para o id do pagamento). */
  consultarPagamento(gatewayRef: string): Promise<{ status: StatusNoGateway; valor?: number; gatewayRef?: string }>
  reembolsar(gatewayRef: string, valor?: number): Promise<{ ok: boolean; reembolsoRef?: string }>
  /**
   * Confere a assinatura usando o corpo CRU (texto, sem ter passado por JSON.parse)
   * e devolve o evento. Devolve null se a assinatura não bater ou o corpo for inválido,
   * e 'ignorar' se a assinatura é boa mas o aviso não interessa (ex.: outro tipo de notificação).
   * `url` é o endereço chamado (alguns gateways assinam parâmetros da URL).
   * É assíncrono porque alguns gateways só mandam o id e o estado vem de uma consulta.
   */
  validarWebhook(
    corpoCru: string,
    cabecalhos: { get(nome: string): string | null },
    url?: URL,
  ): Promise<EventoDoGateway | 'ignorar' | null>
}
