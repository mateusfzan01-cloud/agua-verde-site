import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `servicos.ts` lê variáveis de ambiente e guarda instâncias em globalThis; por isso cada teste
 * limpa as variáveis, zera os módulos e importa de novo.
 */
const VARS = ['LOJA_REPOSITORIO', 'LOJA_GATEWAY', 'LOJA_GATEWAY_PIX', 'LOJA_GATEWAY_CARTAO', 'LOJA_PERMITE_VIAGEM_REAL_EM_TESTE',
  'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'MERCADOPAGO_ACCESS_TOKEN', 'MERCADOPAGO_WEBHOOK_SECRET', 'LOJA_URL_BASE',
  'WOOVI_APP_ID', 'WOOVI_API_URL']

async function carregar(env: Record<string, string>) {
  for (const v of VARS) vi.stubEnv(v, '')
  for (const v of VARS) delete process.env[v]
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v)
  vi.resetModules()
  return import('./servicos')
}

const credenciais = {
  LOJA_REPOSITORIO: 'supabase', SUPABASE_URL: 'https://exemplo.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'chave-de-teste',
  MERCADOPAGO_ACCESS_TOKEN: 'TEST-x', MERCADOPAGO_WEBHOOK_SECRET: 'segredo', LOJA_URL_BASE: 'https://loja.exemplo',
}

beforeEach(() => {
  const g = globalThis as Record<string, unknown>
  for (const k of ['__lojaMemoria', '__lojaGateway', '__lojaSupabase', '__lojaMercadoPago', '__lojaWoovi']) delete g[k]
})
afterEach(() => vi.unstubAllEnvs())

describe('escolha do provedor por forma de pagamento', () => {
  it('sem variável nenhuma: simulado para o Pix e para o cartão, pedidos em memória', async () => {
    const s = await carregar({})
    const d = s.dependencias()
    expect(d.gateways.pix.nome).toBe('simulado')
    expect(d.gateways.cartao.nome).toBe('simulado')
    expect(s.usaProvedorReal()).toBe(false)
    expect(s.gatewayPorNome('simulado')?.nome).toBe('simulado')
    expect(s.gatewayPorNome('mercadopago')).toBeUndefined()
  })

  it('Pix e cartão podem ter provedores diferentes; só o ligado responde pelo nome', async () => {
    // Misto (Pix simulado, cartão real) com banco: só sobe com a opção de teste ligada (ver o teste abaixo).
    const s = await carregar({ ...credenciais, LOJA_GATEWAY_PIX: 'simulado', LOJA_GATEWAY_CARTAO: 'mercadopago', LOJA_PERMITE_VIAGEM_REAL_EM_TESTE: 'true' })
    const d = s.dependencias()
    expect(d.gateways.pix.nome).toBe('simulado')
    expect(d.gateways.cartao.nome).toBe('mercadopago')
    expect(s.usaProvedor('mercadopago')).toBe(true)
    expect(s.gatewayPorNome('mercadopago')?.nome).toBe('mercadopago')
    expect(s.gatewayPorNome('stripe')).toBeUndefined()
  })

  it('LOJA_GATEWAY (forma antiga) vale para os dois meios quando as novas não existem', async () => {
    const s = await carregar({ ...credenciais, LOJA_GATEWAY: 'mercadopago' })
    const d = s.dependencias()
    expect([d.gateways.pix.nome, d.gateways.cartao.nome]).toEqual(['mercadopago', 'mercadopago'])
    expect(s.gatewayPorNome('simulado')).toBeUndefined()
  })

  it('provedor real com pedidos em memória não sobe', async () => {
    const s = await carregar({ LOJA_GATEWAY_CARTAO: 'mercadopago', MERCADOPAGO_ACCESS_TOKEN: 'x', MERCADOPAGO_WEBHOOK_SECRET: 'y', LOJA_URL_BASE: 'https://z' })
    expect(() => s.dependencias()).toThrow(/LOJA_REPOSITORIO=supabase/)
  })

  it('nome de provedor que a loja não conhece derruba a subida dizendo a variável', async () => {
    const s = await carregar({ LOJA_GATEWAY_PIX: 'pagseguro' })
    expect(() => s.dependencias()).toThrow(/LOJA_GATEWAY_PIX=pagseguro: provedor desconhecido/)
    const s2 = await carregar({ LOJA_GATEWAY_CARTAO: 'Stripe' })
    expect(() => s2.dependencias()).toThrow(/LOJA_GATEWAY_CARTAO=stripe: provedor desconhecido/)
  })

  it('um meio real e o outro simulado, com banco real, não sobe sem a opção de teste', async () => {
    const s = await carregar({ ...credenciais, LOJA_GATEWAY_CARTAO: 'mercadopago' }) // Pix fica no simulado
    expect(() => s.dependencias()).toThrow(/LOJA_PERMITE_VIAGEM_REAL_EM_TESTE=true/)
    const s2 = await carregar({ ...credenciais, LOJA_GATEWAY_CARTAO: 'mercadopago', LOJA_PERMITE_VIAGEM_REAL_EM_TESTE: 'true' })
    expect(s2.repositorio().constructor.name).toBe('RepositorioSupabase')
    expect([s2.dependencias().gateways.pix.nome, s2.dependencias().gateways.cartao.nome]).toEqual(['simulado', 'mercadopago'])
  })

  it('tudo simulado com banco real só grava com LOJA_PERMITE_VIAGEM_REAL_EM_TESTE=true', async () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const s = await carregar({ LOJA_REPOSITORIO: 'supabase', SUPABASE_URL: 'https://exemplo.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'k' })
    expect(s.repositorio().constructor.name).toBe('RepositorioEmMemoria')
    expect(aviso).toHaveBeenCalledOnce()
    const s2 = await carregar({ LOJA_REPOSITORIO: 'supabase', SUPABASE_URL: 'https://exemplo.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'k', LOJA_PERMITE_VIAGEM_REAL_EM_TESTE: 'true' })
    expect(s2.repositorio().constructor.name).toBe('RepositorioSupabase')
    aviso.mockRestore()
  })

  it('Woovi no Pix (decisão 31): sobe com o AppID e responde pelo nome na rota do webhook', async () => {
    const s = await carregar({ ...credenciais, LOJA_GATEWAY_PIX: 'woovi', LOJA_GATEWAY_CARTAO: 'mercadopago', WOOVI_APP_ID: 'app-teste' })
    const d = s.dependencias()
    expect([d.gateways.pix.nome, d.gateways.cartao.nome]).toEqual(['woovi', 'mercadopago'])
    expect(s.gatewayPorNome('woovi')?.nome).toBe('woovi')
    expect(s.repositorio().constructor.name).toBe('RepositorioSupabase') // os dois meios reais: não precisa da opção de teste
  })

  it('Woovi sem AppID não sobe; Woovi no cartão é recusada dizendo a variável', async () => {
    const s = await carregar({ ...credenciais, LOJA_GATEWAY_PIX: 'woovi', LOJA_GATEWAY_CARTAO: 'mercadopago' })
    expect(() => s.dependencias()).toThrow(/WOOVI_APP_ID/)
    const s2 = await carregar({ ...credenciais, LOJA_GATEWAY_CARTAO: 'woovi', WOOVI_APP_ID: 'x' })
    expect(() => s2.dependencias()).toThrow(/LOJA_GATEWAY_CARTAO=woovi: este provedor não cobra cartão/)
    const s3 = await carregar({ ...credenciais, LOJA_GATEWAY: 'woovi', WOOVI_APP_ID: 'x' }) // forma antiga vale para os dois meios
    expect(() => s3.dependencias()).toThrow(/LOJA_GATEWAY=woovi: este provedor não cobra cartão/)
  })
})
