/**
 * Repositório de pedidos em MEMÓRIA (simulação).
 * Perde tudo quando o servidor reinicia ou escala para outra instância. Serve só
 * para ver o fluxo; na etapa C é trocado pelo banco (tabelas já criadas por supabase/migrations/*_loja_*).
 */
import { randomBytes, randomUUID } from 'node:crypto'
import type { EventoDoGateway } from './pagamento/gateway'
import type {
  EventoDeAuditoria,
  Pedido,
  RepositorioDePedidos,
  ResultadoDaConfirmacao,
} from './pedidos-tipos'

export function novoTokenDeAcesso(): string {
  return randomBytes(24).toString('base64url') // 32 caracteres
}

export class RepositorioEmMemoria implements RepositorioDePedidos {
  private pedidos = new Map<string, Pedido>()
  private eventos = new Map<string, EventoDoGateway>()
  private auditoria: EventoDeAuditoria[] = []
  private sequencia = 0
  private proximaViagem = 9000

  async proximoNumero(): Promise<string> {
    this.sequencia += 1
    return `AV-${new Date().getFullYear()}-${String(this.sequencia).padStart(6, '0')}`
  }

  async salvar(pedido: Pedido): Promise<void> {
    this.pedidos.set(pedido.id, structuredClone(pedido))
  }

  async buscarPorId(id: string): Promise<Pedido | null> {
    const p = this.pedidos.get(id)
    return p ? structuredClone(p) : null
  }

  async buscarPorToken(token: string): Promise<Pedido | null> {
    for (const p of this.pedidos.values()) if (p.tokenAcesso === token) return structuredClone(p)
    return null
  }

  async buscarPorNumeroEEmail(numero: string, email: string): Promise<Pedido | null> {
    for (const p of this.pedidos.values()) {
      if (p.numero.toLowerCase() === numero.trim().toLowerCase() && p.passageiro.email.toLowerCase() === email.trim().toLowerCase()) {
        return structuredClone(p)
      }
    }
    return null
  }

  async registrarAuditoria(evento: EventoDeAuditoria): Promise<void> {
    this.auditoria.push(evento)
  }

  auditoriaDoPedido(pedidoId: string): EventoDeAuditoria[] {
    return this.auditoria.filter((e) => e.pedidoId === pedidoId)
  }

  async registrarEventoDoGateway(evento: EventoDoGateway): Promise<boolean> {
    // Como no banco: a chave é (gateway, evento_id); o mesmo id em provedores diferentes não é duplicata.
    const chave = `${evento.gateway}:${evento.eventoId}`
    if (this.eventos.has(chave)) return false
    this.eventos.set(chave, evento)
    return true
  }

  async confirmarPedido(pedidoId: string, gatewayRef: string, em: Date = new Date()): Promise<ResultadoDaConfirmacao> {
    const pedido = this.pedidos.get(pedidoId)
    if (!pedido) return { ok: false, motivo: 'pedido_inexistente' }
    if (pedido.status === 'pago') return { ok: true, jaConfirmado: true }

    const aprovado = [...this.eventos.values()].some(
      (e) => e.gatewayRef === gatewayRef && e.pedidoId === pedidoId && e.status === 'aprovado',
    )
    if (!aprovado) return { ok: false, motivo: 'sem_evento_aprovado' }
    // Pago depois do prazo (pedido expirado) é honrado: nenhuma vaga é segurada antes do pagamento.
    if (pedido.status !== 'pendente_pagamento' && pedido.status !== 'expirado') return { ok: false, motivo: 'pedido_nao_pendente' }

    pedido.status = 'pago'
    pedido.pagoEm = em
    pedido.gatewayRef = gatewayRef
    for (const item of pedido.itens) item.viagemId = this.proximaViagem++ // uma viagem por perna
    this.auditoria.push({ pedidoId, tipo: 'pago', detalhes: { gatewayRef }, em })
    return { ok: true, jaConfirmado: false }
  }
}

export function novoIdDePedido(): string {
  return randomUUID()
}
