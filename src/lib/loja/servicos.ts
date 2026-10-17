/**
 * Liga as peças da loja. Hoje: repositório em memória + gateway simulado.
 * Na etapa C, só este arquivo muda (Supabase + Mercado Pago).
 */
import { GatewaySimulado } from './pagamento/simulado'
import { RepositorioEmMemoria } from './repositorio-memoria'
import type { Dependencias } from './fluxo'

const global = globalThis as unknown as {
  __lojaRepo?: RepositorioEmMemoria
  __lojaGateway?: GatewaySimulado
}

export function repositorio(): RepositorioEmMemoria {
  return (global.__lojaRepo ??= new RepositorioEmMemoria())
}

export function gatewaySimulado(): GatewaySimulado {
  return (global.__lojaGateway ??= new GatewaySimulado())
}

export function dependencias(): Dependencias {
  return {
    repo: repositorio(),
    gateway: gatewaySimulado(),
    enviarLinkDaReserva: async (pedido) => {
      // Simulação: não envia nada. Na etapa C: e-mail (Resend) e WhatsApp (template utility).
      console.info(`[simulado] link da reserva ${pedido.numero} reenviado para ${pedido.passageiro.email}`)
    },
  }
}
