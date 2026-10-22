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
  CREATE TABLE public.fornecedores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nome TEXT);
  INSERT INTO public.fornecedores (id, nome) VALUES ('11111111-1111-1111-1111-111111111111', 'Outro'), ('22222222-2222-2222-2222-222222222222', 'Agua Verde');
  CREATE TABLE public.viagens (
    id SERIAL PRIMARY KEY, passageiro_nome TEXT NOT NULL, passageiro_telefone TEXT, passageiro_email TEXT,
    origem TEXT NOT NULL, destino TEXT NOT NULL, data_hora TIMESTAMPTZ NOT NULL, status TEXT NOT NULL,
    valor NUMERIC, moeda TEXT, numero_reserva TEXT, observacoes TEXT, fornecedor_id UUID REFERENCES public.fornecedores (id),
    token_cliente TEXT UNIQUE);
  -- como no banco real: o gatilho gerar_token_cliente cria o token no INSERT
  CREATE FUNCTION public.gerar_token_cliente() RETURNS trigger LANGUAGE plpgsql AS
    $$ BEGIN IF NEW.token_cliente IS NULL THEN NEW.token_cliente := md5(random()::text || clock_timestamp()::text); END IF; RETURN NEW; END $$;
  CREATE TRIGGER trigger_gerar_token BEFORE INSERT ON public.viagens FOR EACH ROW EXECUTE FUNCTION public.gerar_token_cliente();
  CREATE FUNCTION public.is_admin_or_gerente() RETURNS BOOLEAN LANGUAGE sql STABLE AS
    $$ SELECT coalesce(current_setting('app.admin', true), '') = 'on' $$;
`)

for (const arq of ['20261017193120_loja_catalogo.sql', '20261017193226_loja_pedidos.sql', '20261017193302_loja_funcoes.sql', '20261017194244_loja_endurecer_permissoes.sql', '20261017194355_loja_reserva_por_token_so_servidor.sql', '20261017200000_loja_numero_reembolso_pagamento_tardio.sql', '20261022000000_loja_dois_provedores.sql']) {
  await db.exec(readFileSync(new URL(arq, new URL('../migrations/', import.meta.url)), 'utf8'))
  console.log('ok  ', arq)
}

const um = async (sql, params) => (await db.query(sql, params)).rows[0]
const falha = async (sql, trecho) => {
  await assert.rejects(() => db.query(sql), (e) => (assert.match(String(e.message), trecho), true))
}
const comoServico = async (fn) => {
  await db.exec('SET ROLE service_role')
  try { return await fn() } finally { await db.exec('RESET ROLE') }
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
  const p = await um(`INSERT INTO public.pedidos (produto_slug,tipo,idioma,selecao,linhas,valor_total,passageiro_nome,passageiro_telefone,passageiro_email,consent_lgpd_em,expira_em,gateway)
    VALUES ('maragogi-ida-volta','transfer','es','{"veiculos":{"sedan_economico":1}}','[]',$1,'Lucía F','+5491112345678','l@x.com',now(), now() + interval '30 minutes','simulado') RETURNING *`, [valor])
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
await db.exec(`INSERT INTO public.gateway_eventos (gateway,evento_id,pedido_id,gateway_ref,status) VALUES ('simulado','e0','${p1.id}','sim_1','recusado')`)
assert.equal((await um(`SELECT public.confirmar_pedido('${p1.id}','sim_1') AS r`)).r.ok, false)
assert.equal((await um(`SELECT count(*)::int AS n FROM public.viagens`)).n, 0)
ok('sem evento aprovado (ou só recusado) não confirma e não cria viagem')

await db.exec(`INSERT INTO public.gateway_eventos (gateway,evento_id,pedido_id,gateway_ref,status) VALUES ('simulado','e1','${p1.id}','sim_1','aprovado')`)
await falha(`INSERT INTO public.gateway_eventos (gateway,evento_id,pedido_id,gateway_ref,status) VALUES ('simulado','e1','${p1.id}','sim_1','aprovado')`, /gateway_eventos_pkey|duplicate key/)
await db.exec(`INSERT INTO public.gateway_eventos (gateway,evento_id,pedido_id,gateway_ref,status) VALUES ('outro-provedor','e1','${p1.id}','sim_1','recusado')`)
ok('mesmo id de evento vindo de outro provedor não é duplicata: a chave é (gateway, evento_id)')
await falha(`INSERT INTO public.gateway_eventos (evento_id,pedido_id,gateway_ref,status) VALUES ('e-sem-provedor','${p1.id}','sim_1','aprovado')`, /gateway/)
ok('evento sem o nome do provedor é recusado')
ok('evento repetido do gateway falha no banco (idempotência)')

assert.deepEqual((await um(`SELECT public.confirmar_pedido('${p1.id}','sim_1') AS r`)).r, { ok: true, ja_confirmado: false })
const viagens = (await db.query('SELECT * FROM public.viagens ORDER BY id')).rows
assert.equal(viagens.length, 2)
assert.equal(Number(viagens[0].valor) + Number(viagens[1].valor), 741.01)
assert.equal(Number(viagens[0].valor), 370.5) // a diferença de arredondamento (-1 centavo) é ajustada na 1ª perna
assert.equal(Number(viagens[1].valor), 370.51)
assert.equal(viagens[0].status, 'pendente')
assert.equal(viagens[0].moeda, 'BRL')
assert.equal(viagens[0].fornecedor_id, '22222222-2222-2222-2222-222222222222')
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
await falha(`UPDATE public.pedidos SET status='pago', gateway=NULL WHERE id='${p2.id}'`, /pedidos_pago_exige_gateway/)
ok('pedido não pode virar pago sem saber quem o cobrou (pedidos.gateway)')
await db.exec(`INSERT INTO public.gateway_eventos (gateway,evento_id,pedido_id,gateway_ref,status) VALUES ('simulado','e2','${p1.id}','sim_2','aprovado')`)
assert.equal((await um(`SELECT public.confirmar_pedido('${p2.id}','sim_2') AS r`)).r.motivo, 'sem_evento_aprovado')
ok('evento aprovado de OUTRO pedido não confirma este')

await db.exec(`UPDATE public.pedido_itens SET hora = NULL WHERE pedido_id='${p2.id}'`)
await db.exec(`INSERT INTO public.gateway_eventos (gateway,evento_id,pedido_id,gateway_ref,status) VALUES ('simulado','e3','${p2.id}','sim_3','aprovado')`)
await um(`SELECT public.confirmar_pedido('${p2.id}','sim_3')`)
const v3 = (await db.query(`SELECT data_hora, observacoes FROM public.viagens ORDER BY id DESC LIMIT 1`)).rows[0]
assert.match(v3.observacoes, /Horário a combinar/)
ok('passeio sem horário: viagem criada com observação "Horário a combinar"')

await comoAnon(() => falha(`SELECT public.confirmar_pedido('${p1.id}','sim_1')`, /permission denied/))
ok('visitante anônimo não chama confirmar_pedido')

// --- reserva por token ---
const r = await comoServico(() => um('SELECT public.reserva_por_token($1) AS r', [p1.token_acesso]))
assert.equal(r.r.numero, p1.numero)
assert.equal(r.r.itens.length, 2)
assert.equal(r.r.status, 'pago')
assert.equal('token_acesso' in r.r, false)
// cada perna traz o token da própria viagem (é ele que forma o link "Acompanhar minha viagem")
assert.deepEqual(r.r.itens.map((i) => i.viagem_token), viagens.map((v) => v.token_cliente))
assert.ok(r.r.itens.every((i) => typeof i.viagem_token === 'string' && i.viagem_token.length > 0))
assert.equal((await comoServico(() => um('SELECT public.reserva_por_token($1) AS r', ['token-errado']))).r, null)
await comoAnon(() => falha(`SELECT public.reserva_por_token('${p1.token_acesso}')`, /permission denied/))
// endurecimento: nem usuário autenticado escreve em pedidos pelo cliente
await db.exec(`SET app.admin = 'on'; SET ROLE authenticated`)
await falha(`INSERT INTO public.pedido_eventos (pedido_id, tipo) VALUES ('${p1.id}', 'x')`, /permission denied/)
await db.exec('RESET ROLE')
ok('reserva_por_token (só servidor) devolve o necessário e o token da viagem; anônimo não chama; ninguém escreve em pedidos pelo cliente')

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


// --- parte 4: número pela função, pagamento tardio e reembolso ---
const num = (await comoServico(() => um('SELECT public.proximo_numero_pedido() AS n'))).n
assert.match(num, /^AV-\d{4}-\d{6}$/)
await comoAnon(() => falha('SELECT public.proximo_numero_pedido()', /permission denied/))
ok('proximo_numero_pedido: formato AV-AAAA-NNNNNN, só o servidor chama')

// pedido expirado e pago depois do prazo: honra (o cliente pagou; nenhuma vaga era segurada)
const p5 = await novoPedido(500)
await db.exec(`UPDATE public.pedidos SET status='expirado' WHERE id='${p5.id}'`)
await db.exec(`INSERT INTO public.gateway_eventos (gateway,evento_id,pedido_id,gateway_ref,status) VALUES ('simulado','e5','${p5.id}','tardio_1','aprovado')`)
const viagensAntes = (await um('SELECT count(*)::int AS n FROM public.viagens')).n
assert.deepEqual((await um(`SELECT public.confirmar_pedido('${p5.id}','tardio_1') AS r`)).r, { ok: true, ja_confirmado: false })
assert.equal((await um('SELECT count(*)::int AS n FROM public.viagens')).n, viagensAntes + 2)
assert.equal((await um(`SELECT status FROM public.pedidos WHERE id='${p5.id}'`)).status, 'pago')
ok('pagamento aprovado depois do prazo (pedido expirado) confirma e cria as viagens')

// cancelado/reembolsado não volta a ser confirmado
const p6 = await novoPedido(300)
await db.exec(`UPDATE public.pedidos SET status='cancelado' WHERE id='${p6.id}'`)
await db.exec(`INSERT INTO public.gateway_eventos (gateway,evento_id,pedido_id,gateway_ref,status) VALUES ('simulado','e6','${p6.id}','tardio_2','aprovado')`)
assert.deepEqual((await um(`SELECT public.confirmar_pedido('${p6.id}','tardio_2') AS r`)).r, { ok: false, motivo: 'pedido_nao_pendente' })
ok('pedido cancelado não é confirmado por evento aprovado')

// reembolso cancela as viagens que não começaram e não mexe nas que já estão em andamento
const viagensP5 = (await db.query(`SELECT v.id FROM public.viagens v JOIN public.pedido_itens i ON i.viagem_id=v.id WHERE i.pedido_id='${p5.id}' ORDER BY v.id`)).rows
await db.exec(`UPDATE public.viagens SET status='em_andamento' WHERE id=${viagensP5[1].id}`)
const re = (await um(`SELECT public.reembolsar_pedido('${p5.id}','teste') AS r`)).r
assert.deepEqual(re, { ok: true, ja_reembolsado: false, viagens_canceladas: 1 })
assert.equal((await um(`SELECT status FROM public.viagens WHERE id=${viagensP5[0].id}`)).status, 'cancelada')
assert.equal((await um(`SELECT status FROM public.viagens WHERE id=${viagensP5[1].id}`)).status, 'em_andamento')
const ped5 = await um(`SELECT status, cancelado_em FROM public.pedidos WHERE id='${p5.id}'`)
assert.equal(ped5.status, 'reembolsado')
assert.ok(ped5.cancelado_em)
assert.deepEqual((await um(`SELECT public.reembolsar_pedido('${p5.id}') AS r`)).r, { ok: true, ja_reembolsado: true })
assert.deepEqual((await um(`SELECT public.reembolsar_pedido('${p4.id}') AS r`)).r, { ok: false, motivo: 'nao_esta_pago' })
await comoAnon(() => falha(`SELECT public.reembolsar_pedido('${p5.id}')`, /permission denied/))
ok('reembolsar: cancela as viagens não iniciadas, preserva as em andamento, repetir não faz nada, só o servidor chama')

console.log(`\n${n} verificações passaram.`)
