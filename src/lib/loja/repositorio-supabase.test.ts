import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { paraLinhasDb, paraPedido, RepositorioSupabase, type LinhaPedidoDb } from './repositorio-supabase'
import type { Pedido } from './pedidos-tipos'

const PEDIDO_ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b'

const pedido = (over: Partial<Pedido> = {}): Pedido => ({
  id: PEDIDO_ID,
  numero: 'AV-2026-000007',
  tokenAcesso: 'tok_' + 'a'.repeat(40),
  produtoSlug: 'aeroporto-recife-maragogi-ida-e-volta',
  tipo: 'transfer',
  idioma: 'es',
  moeda: 'BRL',
  selecao: { veiculos: { sedan_economico: 1 } },
  linhas: [{ tipo: 'sedan_economico', quantidade: 1, precoUnitario: 740, subtotal: 740 }],
  valorTotal: 740,
  passageiro: { nome: 'Lucía Fernández', telefone: '+5491112345678', email: 'lucia@exemplo.com', cpf: '12345678909', observacoes: 'Cadeirinha' },
  itens: [
    { ordem: 1, origem: 'Aeroporto', destino: 'Maragogi', dataIso: '2026-12-15', hora: '14:30', endereco: 'Pousada', vooNumero: 'G31234', vooCompanhia: 'GOL' },
    { ordem: 2, origem: 'Maragogi', destino: 'Aeroporto', dataIso: '2026-12-22', hora: null },
  ],
  status: 'pendente_pagamento',
  consentimentoEm: new Date('2026-12-01T12:00:00Z'),
  criadoEm: new Date('2026-12-01T12:00:00Z'),
  expiraEm: new Date('2026-12-01T12:30:00Z'),
  ...over,
})

describe('mapeamento pedido <-> banco', () => {
  it('ida e volta: ida e volta viram duas linhas; hora nula (passeio) continua nula', () => {
    const { pedido: linha, itens } = paraLinhasDb(pedido())
    expect(linha).toMatchObject({ numero: 'AV-2026-000007', valor_total: 740, passageiro_cpf: '12345678909', moeda: 'BRL', status: 'pendente_pagamento', gateway_payload: null })
    expect(itens).toHaveLength(2)
    expect(itens[0]).toMatchObject({ pedido_id: PEDIDO_ID, ordem: 1, data: '2026-12-15', hora: '14:30', voo_numero: 'G31234' })
    expect(itens[1]).toMatchObject({ ordem: 2, hora: null, endereco: null })
  })

  it('volta do banco: hora sem segundos, valor numérico em texto, tokens das viagens por perna, Pix do payload', () => {
    const r: LinhaPedidoDb = {
      id: PEDIDO_ID, numero: 'AV-2026-000007', token_acesso: 't'.repeat(32), produto_slug: 'x', tipo: 'transfer', idioma: 'pt', moeda: 'BRL',
      selecao: { pessoas: 1 }, linhas: [], valor_total: '740.50', passageiro_nome: 'A B', passageiro_telefone: '+5581999999999', passageiro_email: 'a@b.com',
      passageiro_cpf: null, observacoes: null, status: 'pago', gateway: 'mercadopago', gateway_ref: '987', gateway_payload: { pix: '0002' }, meio: 'pix',
      consent_lgpd_em: '2026-12-01T12:00:00Z', criado_em: '2026-12-01T12:00:00Z', expira_em: '2026-12-01T12:30:00Z', pago_em: '2026-12-01T12:10:00Z', cancelado_em: null,
      pedido_itens: [
        { ordem: 2, origem: 'B', destino: 'A', data: '2026-12-22', hora: '10:00:00', endereco: null, voo_numero: null, voo_companhia: null, viagem_id: 502 },
        { ordem: 1, origem: 'A', destino: 'B', data: '2026-12-15', hora: null, endereco: 'Hotel', voo_numero: null, voo_companhia: null, viagem_id: 501 },
      ],
    }
    const p = paraPedido(r, new Map([[501, 'tokIda'], [502, 'tokVolta']]))
    expect(p.valorTotal).toBe(740.5)
    expect(p.itens.map((i) => [i.ordem, i.hora, i.viagemId, i.viagemToken])).toEqual([[1, null, 501, 'tokIda'], [2, '10:00', 502, 'tokVolta']])
    expect(p.pix).toBe('0002')
    expect(p.passageiro.cpf).toBeUndefined()
    expect(p.pagoEm).toEqual(new Date('2026-12-01T12:10:00Z'))
    expect(p.status).toBe('pago')
  })
})

/** Cliente de mentira: guarda cada operação e responde o que o teste mandar. */
function falso(resposta: (tabela: string, ops: Record<string, unknown>[]) => { data?: unknown; error?: { message: string; code?: string } | null }) {
  const chamadas: { tabela: string; ops: Record<string, unknown>[] }[] = []
  const rpcs: { nome: string; args: unknown }[] = []
  let rpcResp: Record<string, unknown> = {}
  const db = {
    from(tabela: string) {
      const ops: Record<string, unknown>[] = []
      const b: any = {
        select: (c: string) => (ops.push({ select: c }), b),
        insert: (v: unknown) => (ops.push({ insert: v }), b),
        update: (v: unknown) => (ops.push({ update: v }), b),
        delete: () => (ops.push({ delete: true }), b),
        eq: (c: string, v: unknown) => (ops.push({ eq: [c, v] }), b),
        in: (c: string, v: unknown) => (ops.push({ in: [c, v] }), b),
        limit: () => b,
        maybeSingle: () => b,
        then: (ok: (v: unknown) => unknown, ko: (e: unknown) => unknown) => {
          chamadas.push({ tabela, ops })
          return Promise.resolve({ data: null, error: null, ...resposta(tabela, ops) }).then(ok, ko)
        },
      }
      return b
    },
    rpc(nome: string, args: unknown) {
      rpcs.push({ nome, args })
      return Promise.resolve(rpcResp[nome] ?? { data: null, error: null })
    },
  }
  return { db: db as unknown as SupabaseClient, chamadas, rpcs, definirRpc: (n: string, r: unknown) => void (rpcResp[n] = r) }
}

describe('RepositorioSupabase.salvar', () => {
  it('pedido novo: grava o pedido e depois as pernas', async () => {
    const f = falso(() => ({ data: null }))
    await new RepositorioSupabase(f.db).salvar(pedido())
    const gravacoes = f.chamadas.filter((c) => c.ops.some((o) => 'insert' in o)).map((c) => c.tabela)
    expect(gravacoes).toEqual(['pedidos', 'pedido_itens'])
  })

  it('falha ao gravar as pernas apaga o pedido (nada de pedido sem pernas) e avisa', async () => {
    const f = falso((tabela, ops) => {
      if (tabela === 'pedido_itens' && ops.some((o) => 'insert' in o)) return { error: { message: 'quebrou' } }
      return { data: null }
    })
    await expect(new RepositorioSupabase(f.db).salvar(pedido())).rejects.toThrow(/pernas/)
    expect(f.chamadas.some((c) => c.tabela === 'pedidos' && c.ops.some((o) => 'delete' in o))).toBe(true)
  })

  it('cobrança nova: só atualiza os dados da cobrança, e só se ainda estiver pendente no banco', async () => {
    const f = falso((t, ops) => (ops.some((o) => 'select' in o) ? { data: { id: PEDIDO_ID, status: 'pendente_pagamento' } } : {}))
    await new RepositorioSupabase(f.db).salvar(pedido({ gateway: 'mercadopago', gatewayRef: '987', meio: 'pix', pix: '0002' }))
    const upd = f.chamadas.find((c) => c.ops.some((o) => 'update' in o))!
    expect(upd.ops.find((o) => 'update' in o)!.update).toEqual({ gateway: 'mercadopago', gateway_ref: '987', gateway_payload: { pix: '0002' }, meio: 'pix' })
    expect(upd.ops).toContainEqual({ eq: ['status', 'pendente_pagamento'] })
  })

  it('objeto desatualizado não desfaz pagamento: pedido já pago no banco não é alterado', async () => {
    const f = falso((t, ops) => (ops.some((o) => 'select' in o) ? { data: { id: PEDIDO_ID, status: 'pago' } } : {}))
    await new RepositorioSupabase(f.db).salvar(pedido({ status: 'pendente_pagamento', gatewayRef: 'velho' }))
    expect(f.chamadas.some((c) => c.ops.some((o) => 'update' in o))).toBe(false)
    expect(f.rpcs).toHaveLength(0)
  })

  it('expirar só sai de pendente_pagamento', async () => {
    const f = falso((t, ops) => (ops.some((o) => 'select' in o) ? { data: { id: PEDIDO_ID, status: 'pendente_pagamento' } } : {}))
    await new RepositorioSupabase(f.db).salvar(pedido({ status: 'expirado' }))
    const upd = f.chamadas.find((c) => c.ops.some((o) => 'update' in o))!
    expect(upd.ops).toContainEqual({ update: { status: 'expirado' } })
    expect(upd.ops).toContainEqual({ eq: ['status', 'pendente_pagamento'] })
  })

  it('reembolso passa pela função SQL (que também cancela as viagens), e recusa vira erro', async () => {
    const f = falso((t, ops) => (ops.some((o) => 'select' in o) ? { data: { id: PEDIDO_ID, status: 'pago' } } : {}))
    f.definirRpc('reembolsar_pedido', { data: { ok: true, viagens_canceladas: 2 }, error: null })
    await new RepositorioSupabase(f.db).salvar(pedido({ status: 'reembolsado' }))
    expect(f.rpcs).toEqual([{ nome: 'reembolsar_pedido', args: { p_pedido_id: PEDIDO_ID, p_motivo: null } }])

    const g = falso((t, ops) => (ops.some((o) => 'select' in o) ? { data: { id: PEDIDO_ID, status: 'pendente_pagamento' } } : {}))
    g.definirRpc('reembolsar_pedido', { data: { ok: false, motivo: 'nao_esta_pago' }, error: null })
    await expect(new RepositorioSupabase(g.db).salvar(pedido({ status: 'reembolsado' }))).rejects.toThrow(/nao_esta_pago/)
  })
})

describe('RepositorioSupabase: eventos e confirmação', () => {
  const evento = { gateway: 'mercadopago', eventoId: 'mp_987_approved', gatewayRef: '987', pedidoId: PEDIDO_ID, status: 'aprovado' as const, valor: 740 }

  it('evento novo: true; repetido (23505): false; pedido inexistente (23503): false; outro erro sobe', async () => {
    const com = (error: { message: string; code?: string } | null) => new RepositorioSupabase(falso(() => ({ error })).db)
    expect(await com(null).registrarEventoDoGateway(evento)).toBe(true)
    expect(await com({ message: 'dup', code: '23505' }).registrarEventoDoGateway(evento)).toBe(false)
    expect(await com({ message: 'fk', code: '23503' }).registrarEventoDoGateway(evento)).toBe(false)
    await expect(com({ message: 'fora do ar', code: '08006' }).registrarEventoDoGateway(evento)).rejects.toThrow(/fora do ar/)
  })

  it('confirmar chama a função SQL e traduz as respostas', async () => {
    const f = falso(() => ({}))
    const repo = new RepositorioSupabase(f.db)
    f.definirRpc('confirmar_pedido', { data: { ok: true, ja_confirmado: false }, error: null })
    expect(await repo.confirmarPedido(PEDIDO_ID, '987')).toEqual({ ok: true, jaConfirmado: false })
    expect(f.rpcs[0]).toEqual({ nome: 'confirmar_pedido', args: { p_pedido_id: PEDIDO_ID, p_gateway_ref: '987' } })
    f.definirRpc('confirmar_pedido', { data: { ok: true, ja_confirmado: true }, error: null })
    expect(await repo.confirmarPedido(PEDIDO_ID, '987')).toEqual({ ok: true, jaConfirmado: true })
    f.definirRpc('confirmar_pedido', { data: { ok: false, motivo: 'sem_evento_aprovado' }, error: null })
    expect(await repo.confirmarPedido(PEDIDO_ID, '987')).toEqual({ ok: false, motivo: 'sem_evento_aprovado' })
    f.definirRpc('confirmar_pedido', { data: null, error: { message: 'banco caiu' } })
    await expect(repo.confirmarPedido(PEDIDO_ID, '987')).rejects.toThrow(/banco caiu/)
  })

  it('buscas rejeitam entradas de formato estranho sem ir ao banco', async () => {
    const f = falso(() => ({ data: [] }))
    const repo = new RepositorioSupabase(f.db)
    expect(await repo.buscarPorId("x' or 1=1")).toBeNull()
    expect(await repo.buscarPorToken('curto')).toBeNull()
    expect(f.chamadas).toHaveLength(0)
  })

  it('busca por número e e-mail normaliza (maiúsculas no número, minúsculas no e-mail)', async () => {
    const f = falso(() => ({ data: [] }))
    expect(await new RepositorioSupabase(f.db).buscarPorNumeroEEmail(' av-2026-000007 ', ' Lucia@Exemplo.com ')).toBeNull()
    expect(f.chamadas[0].ops).toContainEqual({ eq: ['numero', 'AV-2026-000007'] })
    expect(f.chamadas[0].ops).toContainEqual({ eq: ['passageiro_email', 'lucia@exemplo.com'] })
  })
})
