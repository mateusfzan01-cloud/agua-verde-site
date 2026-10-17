import type { LinhaDePreco } from './precos'
import type { Idioma, Selecao, TipoProduto } from './tipos'
import type { EventoDoGateway, MeioDePagamento } from './pagamento/gateway'

/**
 * pendente_pagamento → pago → (cancelado → reembolsado)
 * Passeio também é "pago" na hora: vaga garantida no pagamento (decisão 36),
 * então não existe estado "aguardando confirmação".
 */
export type StatusDoPedido = 'pendente_pagamento' | 'pago' | 'cancelado' | 'reembolsado' | 'expirado'

/** Uma perna do pedido (ida ou volta); cada perna vira uma viagem depois do pagamento. */
export interface ItemDoPedido {
  ordem: number
  origem: string
  destino: string
  dataIso: string
  /** null nos passeios: o horário é combinado depois da reserva. */
  hora: string | null
  endereco?: string
  vooNumero?: string
  vooCompanhia?: string
  viagemId?: number
}

export interface PassageiroDoPedido {
  nome: string
  telefone: string
  email: string
  cpf?: string
  observacoes?: string
}

export interface Pedido {
  id: string
  /** AV-2026-000123: só para humanos (e-mail, atendimento). */
  numero: string
  /** Segredo que dá acesso à página da reserva. Nunca o número. */
  tokenAcesso: string
  produtoSlug: string
  tipo: TipoProduto
  idioma: Idioma
  moeda: 'BRL'
  selecao: Selecao
  linhas: LinhaDePreco[]
  valorTotal: number
  passageiro: PassageiroDoPedido
  itens: ItemDoPedido[]
  status: StatusDoPedido
  gateway?: string
  gatewayRef?: string
  meio?: MeioDePagamento
  /** Pix "copia e cola" da cobrança, para a tela de pagamento (no banco: gateway_payload). */
  pix?: string
  consentimentoEm: Date
  criadoEm: Date
  expiraEm: Date
  pagoEm?: Date
  canceladoEm?: Date
}

export interface EventoDeAuditoria {
  pedidoId: string
  tipo: string
  detalhes?: Record<string, unknown>
  em: Date
}

export type ResultadoDaConfirmacao =
  | { ok: true; jaConfirmado: boolean }
  | { ok: false; motivo: 'pedido_inexistente' | 'sem_evento_aprovado' | 'pedido_nao_pendente' }

/**
 * Onde os pedidos ficam. Hoje: memória (simulação). Na etapa C: Supabase, e
 * `confirmarPedido` vira a função SQL `confirmar_pedido` (transacional).
 */
export interface RepositorioDePedidos {
  proximoNumero(): Promise<string>
  salvar(pedido: Pedido): Promise<void>
  buscarPorId(id: string): Promise<Pedido | null>
  buscarPorToken(token: string): Promise<Pedido | null>
  buscarPorNumeroEEmail(numero: string, email: string): Promise<Pedido | null>
  registrarAuditoria(evento: EventoDeAuditoria): Promise<void>
  /** Grava o evento do gateway. Devolve false se já existia (duplicata): nunca reprocessar. */
  registrarEventoDoGateway(evento: EventoDoGateway): Promise<boolean>
  /**
   * Única porta de confirmação (§4.7, item 4): só confirma se existir evento
   * APROVADO gravado para o gatewayRef. Marca pago, cria as viagens, grava os ids.
   */
  confirmarPedido(pedidoId: string, gatewayRef: string, em?: Date): Promise<ResultadoDaConfirmacao>
}
