/**
 * Gateway SIMULADO: não cobra ninguém e não fala com nenhum banco.
 * Serve para ver o fluxo inteiro (checkout, pagamento, confirmação, reembolso)
 * sem conta em provedor nenhum. As cobranças ficam em memória. Serve para Pix e para cartão.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import type {
  Cobranca,
  EntradaDeCobranca,
  EventoDoGateway,
  GatewayDePagamento,
  StatusNoGateway,
} from './gateway'

export const CABECALHO_ASSINATURA = 'x-simulado-assinatura'

interface CobrancaGuardada {
  pedidoId: string
  valor: number
  status: StatusNoGateway
  reembolsado: boolean
}

const global = globalThis as unknown as { __cobrancasSimuladas?: Map<string, CobrancaGuardada> }
const cobrancas = (global.__cobrancasSimuladas ??= new Map<string, CobrancaGuardada>())

function segredo(): string {
  return process.env.LOJA_SEGREDO_WEBHOOK_SIMULADO ?? 'segredo-local-so-para-simulacao'
}

export function assinar(corpo: string): string {
  return createHmac('sha256', segredo()).update(corpo).digest('hex')
}

function assinaturaConfere(corpo: string, recebida: string | null): boolean {
  if (!recebida) return false
  const esperada = Buffer.from(assinar(corpo), 'hex')
  const dada = Buffer.from(recebida, 'hex')
  return esperada.length === dada.length && timingSafeEqual(esperada, dada)
}

export class GatewaySimulado implements GatewayDePagamento {
  readonly nome = 'simulado'

  async criarCobranca(entrada: EntradaDeCobranca): Promise<Cobranca> {
    // Mesmo pedido, mesma cobrança (idempotência).
    const gatewayRef = `sim_${entrada.pedidoId}`
    if (!cobrancas.has(gatewayRef)) {
      cobrancas.set(gatewayRef, { pedidoId: entrada.pedidoId, valor: entrada.valor, status: 'pendente', reembolsado: false })
    }
    if (entrada.meio === 'pix') {
      return {
        gatewayRef,
        status: cobrancas.get(gatewayRef)!.status,
        pix: { copiaECola: `00020126SIMULADO${entrada.pedidoId.replace(/-/g, '').slice(0, 20)}5303986540${entrada.valor.toFixed(2)}6304ABCD` },
      }
    }
    return { gatewayRef, status: cobrancas.get(gatewayRef)!.status, urlDePagamento: `/checkout/${entrada.pedidoId}/pagamento` }
  }

  async consultarPagamento(gatewayRef: string) {
    const c = cobrancas.get(gatewayRef)
    return c ? { status: c.status, valor: c.valor } : { status: 'pendente' as const }
  }

  async reembolsar(gatewayRef: string) {
    const c = cobrancas.get(gatewayRef)
    if (!c || c.status !== 'aprovado' || c.reembolsado) return { ok: false }
    c.reembolsado = true
    c.status = 'reembolsado'
    return { ok: true, reembolsoRef: `sim_reembolso_${gatewayRef}` }
  }

  async validarWebhook(corpoCru: string, cabecalhos: { get(nome: string): string | null }): Promise<EventoDoGateway | null> {
    if (!assinaturaConfere(corpoCru, cabecalhos.get(CABECALHO_ASSINATURA))) return null
    try {
      const e = JSON.parse(corpoCru) as Partial<EventoDoGateway>
      if (!e.eventoId || !e.gatewayRef || !e.pedidoId || !e.status) return null
      return { gateway: this.nome, eventoId: e.eventoId, gatewayRef: e.gatewayRef, pedidoId: e.pedidoId, status: e.status, valor: e.valor }
    } catch {
      return null
    }
  }

  /**
   * Só existe na simulação: "o cliente pagou". Devolve o corpo do aviso e a
   * assinatura, como o gateway real mandaria para o nosso webhook.
   */
  simularPagamentoAprovado(gatewayRef: string): { corpo: string; assinatura: string } | null {
    const c = cobrancas.get(gatewayRef)
    if (!c) return null
    c.status = 'aprovado'
    const corpo = JSON.stringify({
      gateway: this.nome,
      eventoId: `evt_${gatewayRef}_aprovado`,
      gatewayRef,
      pedidoId: c.pedidoId,
      status: 'aprovado',
      valor: c.valor,
    } satisfies EventoDoGateway)
    return { corpo, assinatura: assinar(corpo) }
  }
}
