/**
 * Liga as peças da loja. Padrão (sem nenhuma variável): repositório em memória + gateway simulado,
 * que não toca no banco nem cobra ninguém. Para ligar o real, por variáveis de ambiente (docs/loja/CODIGO_LOJA_B.md):
 *
 *   LOJA_REPOSITORIO=supabase   grava os pedidos no Supabase (precisa de SUPABASE_SERVICE_ROLE_KEY)
 *   LOJA_GATEWAY=mercadopago    cobra pelo Mercado Pago (precisa do repositório Supabase, do token e do segredo)
 *
 * Travas de segurança:
 *  - gateway real com repositório em memória não sobe (o pedido pago sumiria);
 *  - gateway simulado com banco real só com LOJA_PERMITE_VIAGEM_REAL_EM_TESTE=true, porque "Simular pagamento"
 *    cria viagens de verdade na operação (aparecem para a equipe); sem isso, volta para a memória.
 */
import { createClient } from '@supabase/supabase-js'
import { GatewayMercadoPago } from './pagamento/mercadopago'
import { GatewaySimulado } from './pagamento/simulado'
import type { GatewayDePagamento } from './pagamento/gateway'
import { RepositorioEmMemoria } from './repositorio-memoria'
import { RepositorioSupabase } from './repositorio-supabase'
import type { Dependencias } from './fluxo'
import type { RepositorioDePedidos } from './pedidos-tipos'

const global = globalThis as unknown as {
  __lojaMemoria?: RepositorioEmMemoria
  __lojaGateway?: GatewaySimulado
  __lojaSupabase?: RepositorioSupabase
  __lojaMercadoPago?: GatewayMercadoPago
}

export function usaBanco(): boolean {
  return process.env.LOJA_REPOSITORIO === 'supabase'
}

export function usaMercadoPago(): boolean {
  return process.env.LOJA_GATEWAY === 'mercadopago'
}

function exigir(nome: string): string {
  const v = process.env[nome]
  if (!v) throw new Error(`Variável de ambiente ${nome} não configurada`)
  return v
}

function repositorioSupabase(): RepositorioSupabase {
  if (!global.__lojaSupabase) {
    const url = process.env.SUPABASE_URL ?? exigir('NEXT_PUBLIC_SUPABASE_URL')
    const cliente = createClient(url, exigir('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } })
    global.__lojaSupabase = new RepositorioSupabase(cliente)
  }
  return global.__lojaSupabase
}

export function gatewaySimulado(): GatewaySimulado {
  return (global.__lojaGateway ??= new GatewaySimulado())
}

function gatewayMercadoPago(): GatewayMercadoPago {
  return (global.__lojaMercadoPago ??= new GatewayMercadoPago({
    accessToken: exigir('MERCADOPAGO_ACCESS_TOKEN'),
    segredoWebhook: exigir('MERCADOPAGO_WEBHOOK_SECRET'),
    urlBase: exigir('LOJA_URL_BASE').replace(/\/$/, ''),
  }))
}

export function repositorio(): RepositorioDePedidos {
  if (usaBanco()) {
    if (usaMercadoPago() || process.env.LOJA_PERMITE_VIAGEM_REAL_EM_TESTE === 'true') return repositorioSupabase()
    console.warn('[loja] LOJA_REPOSITORIO=supabase com gateway simulado exige LOJA_PERMITE_VIAGEM_REAL_EM_TESTE=true; usando memória.')
  } else if (usaMercadoPago()) {
    throw new Error('LOJA_GATEWAY=mercadopago exige LOJA_REPOSITORIO=supabase (pedidos em memória se perderiam).')
  }
  return (global.__lojaMemoria ??= new RepositorioEmMemoria())
}

export function gateway(): GatewayDePagamento {
  return usaMercadoPago() ? gatewayMercadoPago() : gatewaySimulado()
}

export function dependencias(): Dependencias {
  return {
    repo: repositorio(),
    gateway: gateway(),
    enviarLinkDaReserva: async (pedido) => {
      // Ainda não envia nada. Próximo passo da etapa C: e-mail (Resend) e WhatsApp (template utility).
      console.info(`[loja] link da reserva ${pedido.numero} (envio ainda não implementado)`)
    },
  }
}
