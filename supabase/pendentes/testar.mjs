// Roda as migrations desta pasta num Postgres de verdade (PGlite, em memória) e confere o comportamento.
// Não toca em nenhum banco de verdade. Uso (na raiz do projeto):
//   npm install --no-save @electric-sql/pglite && node supabase/pendentes/testar.mjs
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const pasta = new URL('./', import.meta.url)
const db = new PGlite()

// Tabelas e funções que já existem no banco real; aqui só stubs mínimos.
await db.exec(`
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN;
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  -- O Supabase dá estas permissões padrão a tudo que nasce em public; as migrations é que restringem (RLS e REVOKE).
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
  CREATE TABLE public.fornecedores (id SERIAL PRIMARY KEY, nome TEXT);
  INSERT INTO public.fornecedores (nome) VALUES ('Outro'), ('Agua Verde Viagens');
  CREATE TABLE public.viagens (
    id SERIAL PRIMARY KEY, passageiro_nome TEXT NOT NULL, passageiro_telefone TEXT, passageiro_email TEXT,
    origem TEXT NOT NULL, destino TEXT NOT NULL, data_hora TIMESTAMPTZ NOT NULL, status TEXT NOT NULL,
    valor NUMERIC, moeda TEXT, numero_reserva TEXT, observacoes TEXT, fornecedor_id INT);
  CREATE FUNCTION public.is_admin_or_gerente() RETURNS BOOLEAN LANGUAGE sql STABLE AS
    $$ SELECT coalesce(current_setting('app.admin', true), '') = 'on' $$;
`)

for (const arq of ['20261020000100_loja_catalogo.sql', '20261020000200_loja_pedidos.sql', '20261020000300_loja_funcoes.sql']) {
  await db.exec(readFileSync(new URL(arq, pasta), 'utf8'))
  console.log('ok  ', arq)
}

const um = async (sql, params) => (await db.query(sql, params)).rows[0]
const falha = async (sql, trecho) => {
  await assert.rejects(() => db.query(sql), (e) => (assert.match(String(e.message), trecho), true))
}
const comoAnon = async (fn) => {
  await db.exec('SET ROLE anon')
  try { return await fn() } finally { await db.exec('RESET ROLE') }
}
let n = 0
const ok = (nome) => console.log(`ok   ${++n}. ${nome}`)

// --- catálogo ---
await db.exec(`INSERT INTO public.tipos_veiculo VALUES ('sedan_economico','{"pt":"Sedan"}','{"pt":"3 pessoas"}',3)`)
await db.exec(`INSERT INTO public.produtos (slug,tipo,nome,descricao,origem_padrao,destino_padrao,sentido,veiculos)
  VALUES ('maragogi-ida-volta','transfer','{"pt":"Maragogi"}','{"pt":"x"}','Aeroporto','Maragogi','ida_volta','[{"tipo":"sedan_economico","preco":740}]')`)
await db.exec(`INSERT INTO public.produtos (slug,tipo,nome,descricao,origem_padrao,destino_padrao,modelo_preco,preco_por_pessoa)
  VALUES ('mergulho','passeio','{"pt":"M"}','{"pt":"x"}','A','B','por_pessoa',1020)`)
await db.exec(`INSERT INTO public.produtos (slug,tipo,nome,descricao,origem_padrao,destino_padrao,veiculos,ativo)
  VALUES ('inativo','transfer','{"pt":"I"}','{"pt":"x"}','A','B','[{"tipo":"sedan_economico","preco":1}]', false)`)
await falha(`INSERT INTO public.produtos (slug,tipo,nome,descricao,origem_padrao,destino_padrao,modelo_preco) VALUES ('s1','passeio','{}','{}','A','B','por_pessoa')`, /produtos_preco_coerente/)
await falha(`INSERT INTO public.produtos (slug,tipo,nome,descricao,origem_padrao,destino_padrao) VALUES ('s2','transfer','{}','{}','A','B')`, /produtos_preco_coerente/)
ok('produto por pessoa exige preço por pessoa; por veículo exige lista de veículos')
await falha(`INSERT INTO public.alta_temporada (inicio, fim) VALUES ('2026-12-31','2026-12-20')`, /alta_temporada_periodo/)
ok('período de alta temporada com fim antes do início é recusado')
const vistos = await comoAnon(() => db.query('SELECT slug FROM public.produtos ORDER BY slug'))
assert.deepEqual(vistos.rows.map((r) => r.slug), ['maragogi-ida-volta', 'mergulho'])
ok('visitante anônimo lê o catálogo, mas só os produtos ativos')
await comoAnon(() => falha(`INSERT INTO public.produtos (slug,tipo,nome,descricao,origem_padrao,destino_padrao,veiculos) VALUES ('hack','transfer','{}','{}','A','B','[{"tipo":"x","preco":1}]')`, /row-level security|permission denied/))
ok('visitante anônimo não escreve no catálogo')

// --- pedidos ---
const novoPedido = async (valor) => {
  const p = await um(`INSERT INTO public.pedidos (produto_slug,tipo,idioma,selecao,linhas,valor_total,passageiro_nome,passageiro_telefone,passageiro_email,consent_lgpd_em,expira_em)
    VALUES ('maragogi-ida-volta','transfer','es','{"veiculos":{"sedan_economico":1}}','[]',$1,'Lucía F','+5491112345678','l@x.com',now(), now() + interval '30 minutes') RETURNING *`, [valor])
  await db.exec(`INSERT INTO public.pedido_itens (pedido_id,ordem,origem,destino,data,hora) VALUES
    ('${p.id}',1,'Aeroporto','Maragogi','2026-12-15','14:30'), ('${p.id}',2,'Maragogi','Aeroporto','2026-12-22','10:00')`)
  return p
}
const p1 = await novoPedido(741.01)
assert.match(p1.numero, /^AV-\d{4}-\d{6}$/)
assert.equal(p1.token_acesso.length, 64)
assert.equal(p1.moeda, 'BRL')
ok('pedido nasce com número AV-AAAA-NNNNNN, token de 64 caracteres e moeda BRL')
await falha(`UPDATE public.pedidos SET moeda='USD' WHERE id='${p1.id}'`, /pedidos_moeda_check/)
await falha(`UPDATE public.pedidos SET status='aguardando_confirmacao' WHERE id='${p1.id}'`, /pedidos_status_check/)
ok('moeda só BRL; status "aguardando_confirmacao" não existe mais (decisão 36)')
await comoAnon(() => falha('SELECT * FROM public.pedidos', /permission denied/))
await comoAnon(() => falha('SELECT * FROM public.gateway_eventos', /permission denied/))
await comoAnon(() => falha('SELECT * FROM public.pedido_itens', /permission denied/))
ok('visitante anônimo não lê pedidos, itens nem eventos do gateway')
await db.exec(`SET app.admin = 'on'; SET ROLE authenticated`)
assert.equal((await db.query('SELECT 1 FROM public.pedidos')).rows.length, 1)
await db.exec(`RESET ROLE; SET app.admin = 'off'; SET ROLE authenticated`)
assert.equal((await db.query('SELECT 1 FROM public.pedidos')).rows.length, 0)
await db.exec('RESET ROLE')
ok('admin/gerente lê pedidos; usuário autenticado comum não vê nenhum')

// --- confirmar_pedido ---
assert.deepEqual((await um(`SELECT public.confirmar_pedido('${p1.id}','sim_1') AS r`)).r, { ok: false, motivo: 'sem_evento_aprovado' })
await db.exec(`INSERT INTO public.gateway_eventos (evento_id,pedido_id,gateway_ref,status) VALUES ('e0','${p1.id}','sim_1','recusado')`)
assert.equal((await um(`SELECT public.confirmar_pedido('${p1.id}','sim_1') AS r`)).r.ok, false)
assert.equal((await um(`SELECT count(*)::int AS n FROM public.viagens`)).n, 0)
ok('sem evento aprovado (ou só recusado) não confirma e não cria viagem')

await db.exec(`INSERT INTO public.gateway_eventos (evento_id,pedido_id,gateway_ref,status) VALUES ('e1','${p1.id}','sim_1','aprovado')`)
await falha(`INSERT INTO public.gateway_eventos (evento_id,pedido_id,gateway_ref,status) VALUES ('e1','${p1.id}','sim_1','aprovado')`, /gateway_eventos_pkey|duplicate key/)
ok('evento repetido do gateway falha no banco (idempotência)')

assert.deepEqual((await um(`SELECT public.confirmar_pedido('${p1.id}','sim_1') AS r`)).r, { ok: true, ja_confirmado: false })
const viagens = (await db.query('SELECT * FROM public.viagens ORDER BY id')).rows
assert.equal(viagens.length, 2)
assert.equal(Number(viagens[0].valor) + Number(viagens[1].valor), 741.01)
assert.equal(Number(viagens[0].valor), 370.5) // a diferença de arredondamento (-1 centavo) é ajustada na 1ª perna
assert.equal(Number(viagens[1].valor), 370.51)
assert.equal(viagens[0].status, 'pendente')
assert.equal(viagens[0].moeda, 'BRL')
assert.equal(viagens[0].fornecedor_id, 2)
assert.equal(viagens[0].numero_reserva, p1.numero)
assert.equal(new Date(viagens[0].data_hora).toISOString(), '2026-12-15T17:30:00.000Z') // 14:30 em Recife (UTC-3)
const itens = (await db.query(`SELECT viagem_id FROM public.pedido_itens WHERE pedido_id='${p1.id}' ORDER BY ordem`)).rows
assert.deepEqual(itens.map((i) => i.viagem_id), viagens.map((v) => v.id))
assert.equal((await um(`SELECT status FROM public.pedidos WHERE id='${p1.id}'`)).status, 'pago')
ok('confirmar: pedido vira pago, uma viagem por perna, centavos somam o total, horário de Recife')

assert.deepEqual((await um(`SELECT public.confirmar_pedido('${p1.id}','sim_1') AS r`)).r, { ok: true, ja_confirmado: true })
assert.equal((await um(`SELECT count(*)::int AS n FROM public.viagens`)).n, 2)
ok('confirmar de novo não duplica viagem')

const p2 = await novoPedido(500)
await db.exec(`INSERT INTO public.gateway_eventos (evento_id,pedido_id,gateway_ref,status) VALUES ('e2','${p1.id}','sim_2','aprovado')`)
assert.equal((await um(`SELECT public.confirmar_pedido('${p2.id}','sim_2') AS r`)).r.motivo, 'sem_evento_aprovado')
ok('evento aprovado de OUTRO pedido não confirma este')

await db.exec(`UPDATE public.pedido_itens SET hora = NULL WHERE pedido_id='${p2.id}'`)
await db.exec(`INSERT INTO public.gateway_eventos (evento_id,pedido_id,gateway_ref,status) VALUES ('e3','${p2.id}','sim_3','aprovado')`)
await um(`SELECT public.confirmar_pedido('${p2.id}','sim_3')`)
const v3 = (await db.query(`SELECT data_hora, observacoes FROM public.viagens ORDER BY id DESC LIMIT 1`)).rows[0]
assert.match(v3.observacoes, /Horário a combinar/)
ok('passeio sem horário: viagem criada com observação "Horário a combinar"')

await comoAnon(() => falha(`SELECT public.confirmar_pedido('${p1.id}','sim_1')`, /permission denied/))
ok('visitante anônimo não chama confirmar_pedido')

// --- reserva por token ---
const r = await comoAnon(() => um('SELECT public.reserva_por_token($1) AS r', [p1.token_acesso]))
assert.equal(r.r.numero, p1.numero)
assert.equal(r.r.itens.length, 2)
assert.equal(r.r.status, 'pago')
assert.equal('token_acesso' in r.r, false)
assert.equal((await comoAnon(() => um('SELECT public.reserva_por_token($1) AS r', ['token-errado']))).r, null)
ok('reserva_por_token devolve só o necessário, sem o token; token errado devolve nada')

// --- expiração ---
const p3 = await um(`INSERT INTO public.pedidos (produto_slug,tipo,idioma,selecao,linhas,valor_total,passageiro_nome,passageiro_telefone,passageiro_email,consent_lgpd_em,expira_em)
  VALUES ('x','passeio','pt','{}','[]',100,'A B','+5581999999999','a@b.com',now(), now() - interval '20 minutes') RETURNING id`)
const p4 = await um(`INSERT INTO public.pedidos (produto_slug,tipo,idioma,selecao,linhas,valor_total,passageiro_nome,passageiro_telefone,passageiro_email,consent_lgpd_em,expira_em)
  VALUES ('x','passeio','pt','{}','[]',100,'A B','+5581999999999','a@b.com',now(), now() + interval '10 minutes') RETURNING id`)
assert.equal((await um('SELECT public.expirar_pedidos_pendentes() AS n')).n, 1)
assert.equal((await um(`SELECT status FROM public.pedidos WHERE id='${p3.id}'`)).status, 'expirado')
assert.equal((await um(`SELECT status FROM public.pedidos WHERE id='${p4.id}'`)).status, 'pendente_pagamento')
assert.equal((await um(`SELECT status FROM public.pedidos WHERE id='${p1.id}'`)).status, 'pago')
ok('expirar: só pedidos pendentes e vencidos há mais de 15 min; pagos e recentes ficam')

console.log(`\n${n} verificações passaram.`)
