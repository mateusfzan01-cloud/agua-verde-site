/**
 * Liga as peças da loja. Padrão (sem nenhuma variável): repositório em memória + gateway simulado
 * para o Pix e para o cartão, que não toca no banco nem cobra ninguém. Para ligar o real, por variáveis
 * de ambiente (docs/loja/CODIGO_LOJA_B.md):
 *
 *   LOJA_REPOSITORIO=supabase        grava os pedidos no Supabase (precisa de SUPABASE_SERVICE_ROLE_KEY)
 *   LOJA_GATEWAY_PIX=<provedor>      quem cobra o Pix    (decisão 31: woovi; também simulado | mercadopago)
 *   LOJA_GATEWAY_CARTAO=<provedor>   quem cobra o cartão (decisão 31: stripe, etapa B3; hoje: simulado | mercadopago)
 *
 * Um provedor por forma de pagamento: cada pedido lembra quem o cobrou (`pedidos.gateway`), e o reembolso
 * e a consulta sempre voltam a esse mesmo provedor. `LOJA_GATEWAY=<provedor>` (forma antiga) vale para os
 * dois meios quando as duas variáveis novas não estão definidas.
 *
 * Travas de segurança:
 *  - provedor real com repositório em memória não sobe (o pedido pago sumiria);
 *  - simulado com banco real só com LOJA_PERMITE_VIAGEM_REAL_EM_TESTE=true, porque "Simular pagamento"
 *    cria viagens de verdade na operação (aparecem para a equipe). Tudo simulado sem a opção: volta para a
 *    memória com aviso. Um meio real e o outro simulado sem a opção: a loja não sobe, porque o lado real
 *    precisa do banco e o lado simulado criaria viagens de verdade sem ninguém pedir;
 *  - nome de provedor desconhecido derruba a loja na subida, dizendo qual variável está errada.
 */
import { createClient } from '@supabase/supabase-js'
import { GatewayMercadoPago } from './pagamento/mercadopago'
import { GatewaySimulado } from './pagamento/simulado'
import { GatewayWoovi, HOST_SANDBOX } from './pagamento/woovi'
import type { GatewayDePagamento, MeioDePagamento } from './pagamento/gateway'
import { RepositorioEmMemoria } from './repositorio-memoria'
import { RepositorioSupabase } from './repositorio-supabase'
import type { Dependencias } from './fluxo'
import type { RepositorioDePedidos } from './pedidos-tipos'

const global = globalThis as unknown as {
  __lojaMemoria?: RepositorioEmMemoria
  __lojaGateway?: GatewaySimulado
  __lojaSupabase?: RepositorioSupabase
  __lojaMercadoPago?: GatewayMercadoPago
  __lojaWoovi?: GatewayWoovi
}

export type NomeDoProvedor = 'simulado' | 'mercadopago' | 'woovi'

const PROVEDORES: Record<NomeDoProvedor, () => GatewayDePagamento> = {
  simulado: () => gatewaySimulado(),
  mercadopago: () => gatewayMercadoPago(),
  woovi: () => gatewayWoovi(),
}

/** Formas de pagamento que cada provedor cobra (a Woovi é só Pix). */
const MEIOS_DO_PROVEDOR: Record<NomeDoProvedor, readonly MeioDePagamento[]> = {
  simulado: ['pix', 'cartao'],
  mercadopago: ['pix', 'cartao'],
  woovi: ['pix'],
}

function ehProvedor(nome: string): nome is NomeDoProvedor {
  return Object.prototype.hasOwnProperty.call(PROVEDORES, nome)
}

/**
 * Nome do provedor configurado para o meio. Erro claro, dizendo a variável, se o nome for desconhecido
 * ou se o provedor não cobrar esse meio (por exemplo, a Woovi no cartão).
 */
export function nomeDoProvedor(meio: MeioDePagamento): NomeDoProvedor {
  const especifica = meio === 'pix' ? 'LOJA_GATEWAY_PIX' : 'LOJA_GATEWAY_CARTAO'
  const variavel = process.env[especifica] !== undefined ? especifica : process.env.LOJA_GATEWAY !== undefined ? 'LOJA_GATEWAY' : especifica
  const nome = (process.env[variavel] ?? 'simulado').trim().toLowerCase()
  if (!ehProvedor(nome)) {
    throw new Error(`${variavel}=${nome}: provedor desconhecido (aceitos: ${Object.keys(PROVEDORES).join(', ')})`)
  }
  if (!MEIOS_DO_PROVEDOR[nome].includes(meio)) {
    throw new Error(`${variavel}=${nome}: este provedor não cobra ${meio === 'pix' ? 'Pix' : 'cartão'}`)
  }
  return nome
}

export function usaBanco(): boolean {
  return process.env.LOJA_REPOSITORIO === 'supabase'
}

/** Algum dos dois meios cobra de verdade (não é o simulado). */
export function usaProvedorReal(): boolean {
  return nomeDoProvedor('pix') !== 'simulado' || nomeDoProvedor('cartao') !== 'simulado'
}

/** Algum dos dois meios é o simulado. */
export function usaSimulado(): boolean {
  return nomeDoProvedor('pix') === 'simulado' || nomeDoProvedor('cartao') === 'simulado'
}

/** O provedor está ligado para pelo menos um meio (as rotas de webhook usam isto para responder 404 ao resto). */
export function usaProvedor(nome: string): boolean {
  return nomeDoProvedor('pix') === nome || nomeDoProvedor('cartao') === nome
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

function gatewayWoovi(): GatewayWoovi {
  // Sem WOOVI_API_URL, vai para o sandbox: produção precisa ser pedida de forma explícita (https://api.woovi.com).
  return (global.__lojaWoovi ??= new GatewayWoovi({
    appId: exigir('WOOVI_APP_ID'),
    urlApi: process.env.WOOVI_API_URL?.trim() || HOST_SANDBOX,
  }))
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
    const permiteSimuladoNoBanco = process.env.LOJA_PERMITE_VIAGEM_REAL_EM_TESTE === 'true'
    if (!usaSimulado() || permiteSimuladoNoBanco) return repositorioSupabase()
    if (usaProvedorReal()) {
      throw new Error(
        'Um meio com provedor real e o outro simulado, com LOJA_REPOSITORIO=supabase, exige LOJA_PERMITE_VIAGEM_REAL_EM_TESTE=true: ' +
          'o "Simular pagamento" criaria viagens de verdade. Ponha os dois meios em provedor real ou ligue a opção de teste.',
      )
    }
    console.warn('[loja] LOJA_REPOSITORIO=supabase com gateway simulado exige LOJA_PERMITE_VIAGEM_REAL_EM_TESTE=true; usando memória.')
  } else if (usaProvedorReal()) {
    throw new Error('Provedor de pagamento real exige LOJA_REPOSITORIO=supabase (pedidos em memória se perderiam).')
  }
  return (global.__lojaMemoria ??= new RepositorioEmMemoria())
}

/** O provedor que cobra este meio de pagamento. */
export function gatewayPara(meio: MeioDePagamento): GatewayDePagamento {
  return PROVEDORES[nomeDoProvedor(meio)]()
}

/** O provedor pelo nome, só se estiver ligado para algum meio; senão undefined (rota de webhook responde 404). */
export function gatewayPorNome(nome: string): GatewayDePagamento | undefined {
  return ehProvedor(nome) && usaProvedor(nome) ? PROVEDORES[nome]() : undefined
}

export function dependencias(): Dependencias {
  return {
    repo: repositorio(),
    gateways: { pix: gatewayPara('pix'), cartao: gatewayPara('cartao') },
    enviarLinkDaReserva: async (pedido) => {
      // Ainda não envia nada. Etapa A3 do plano: a Edge Function `loja-pedido-pago` manda e-mail e WhatsApp.
      console.info(`[loja] link da reserva ${pedido.numero} (envio ainda não implementado)`)
    },
  }
}
