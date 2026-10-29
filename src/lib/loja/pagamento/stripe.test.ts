import Stripe from 'stripe'
import { describe, expect, it } from 'vitest'
import { CABECALHO_ASSINATURA, centavos, GatewayStripe, mapearStatusDaSessao, mapearStatusDoPagamento } from './stripe'

const PEDIDO = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b'
const AGORA = Date.parse('2026-12-01T12:00:00Z')
const SEGREDO = 'whsec_teste_da_loja'
const CHAVE = 'sk_test_da_loja'

interface Chamada { url: string; metodo: string; cab: Headers; form: URLSearchParams }
type Resposta = { status?: number; corpo: unknown }

/** Responde pela primeira chave contida na URL ("METODO caminho"). */
function mockFetch(respostas: Record<string, Resposta>) {
  const chamadas: Chamada[] = []
  const f = (async (url: string, init: RequestInit = {}) => {
    const metodo = init.method ?? 'GET'
    chamadas.push({ url, metodo, cab: new Headers(init.headers as HeadersInit), form: new URLSearchParams((init.body as string) ?? '') })
    const chave = Object.keys(respostas).find((k) => {
      const [m, caminho] = k.split(' ')
      return m === metodo && url.includes(caminho)
    })
    if (!chave) return new Response(JSON.stringify({ error: { type: 'api_error', message: 'nao mockado' } }), { status: 500 })
    return new Response(JSON.stringify(respostas[chave].corpo), { status: respostas[chave].status ?? 200 })
  }) as unknown as typeof fetch
  return { f, chamadas }
}

const erroStripe = (status: number, code: string) => ({ status, corpo: { error: { type: 'invalid_request_error', code, message: code } } })

function gw(f: typeof fetch, agora = AGORA) {
  return new GatewayStripe({ chaveSecreta: CHAVE, segredoWebhook: SEGREDO, urlBase: 'https://aguaverdeviagens.com.br', fetch: f, agora: () => agora })
}

const entrada = {
  pedidoId: PEDIDO,
  valor: 212.35,
  meio: 'cartao' as const,
  descricao: 'Água Verde AV-2026-000007',
  pagador: { nome: 'John Smith', email: 'john@x.com', telefone: '+447700900123' },
  expiraEm: new Date(AGORA + 30 * 60_000),
  idioma: 'en' as const,
}

const sessaoCriada = { id: 'cs_test_a1', object: 'checkout.session', url: 'https://checkout.stripe.com/c/pay/cs_test_a1', status: 'open', payment_status: 'unpaid' }

const sessao = (extra: Record<string, unknown> = {}) => ({
  id: 'cs_test_a1',
  object: 'checkout.session',
  client_reference_id: PEDIDO,
  currency: 'brl',
  amount_total: 21235,
  status: 'complete',
  payment_status: 'paid',
  payment_intent: 'pi_test_9',
  ...extra,
})

const evento = (type: string, objeto: Record<string, unknown>, id = 'evt_test_1') =>
  JSON.stringify({ id, object: 'event', type, api_version: '2026-08-26.dahlia', data: { object: objeto } })

const assinar = (corpo: string, segredo = SEGREDO, timestamp?: number) =>
  new Stripe(CHAVE).webhooks.generateTestHeaderString({ payload: corpo, secret: segredo, ...(timestamp ? { timestamp } : {}) })

const cabecalho = (assinatura: string | null) => ({ get: (n: string) => (n.toLowerCase() === CABECALHO_ASSINATURA ? assinatura : null) })

describe('estados e centavos', () => {
  it('traduz sessão e pagamento', () => {
    expect(mapearStatusDaSessao({ status: 'complete', payment_status: 'paid' })).toBe('aprovado')
    expect(mapearStatusDaSessao({ status: 'open', payment_status: 'unpaid' })).toBe('pendente')
    expect(mapearStatusDaSessao({ status: 'expired', payment_status: 'unpaid' })).toBe('cancelado')
    expect(mapearStatusDoPagamento('succeeded')).toBe('aprovado')
    expect(mapearStatusDoPagamento('canceled')).toBe('cancelado')
    expect(mapearStatusDoPagamento('requires_payment_method')).toBe('pendente')
  })

  it('converte reais em centavos sem erro de ponto flutuante', () => {
    expect(centavos(350)).toBe(35000)
    expect(centavos(212.35)).toBe(21235)
    expect(centavos(0.1 + 0.2)).toBe(30)
    expect(centavos(740.01)).toBe(74001)
  })
})

describe('criarCobranca', () => {
  it('página hospedada: só cartão, idioma do pedido, botão Reservar, pedido como referência, centavos, chave secreta', async () => {
    const { f, chamadas } = mockFetch({ 'POST /v1/checkout/sessions': { corpo: sessaoCriada } })
    const c = await gw(f).criarCobranca(entrada)
    expect(c).toEqual({ gatewayRef: 'cs_test_a1', status: 'pendente', urlDePagamento: 'https://checkout.stripe.com/c/pay/cs_test_a1' })
    const [req] = chamadas
    expect(req.url).toBe('https://api.stripe.com/v1/checkout/sessions')
    expect(req.cab.get('authorization')).toBe(`Bearer ${CHAVE}`)
    const b = req.form
    expect(b.get('mode')).toBe('payment')
    expect(b.get('payment_method_types[0]')).toBe('card')
    expect(b.get('payment_method_types[1]')).toBeNull()
    expect(b.get('locale')).toBe('en')
    expect(b.get('submit_type')).toBe('book')
    expect(b.get('client_reference_id')).toBe(PEDIDO)
    expect(b.get('customer_email')).toBe('john@x.com')
    expect(b.get('line_items[0][price_data][currency]')).toBe('brl')
    expect(b.get('line_items[0][price_data][unit_amount]')).toBe('21235')
    expect(b.get('line_items[0][price_data][product_data][name]')).toBe('Água Verde AV-2026-000007')
    expect(b.get('payment_intent_data[metadata][pedido_id]')).toBe(PEDIDO)
    expect(b.get('success_url')).toBe(`https://aguaverdeviagens.com.br/en/checkout/${PEDIDO}`)
    expect(b.get('cancel_url')).toBe(`https://aguaverdeviagens.com.br/en/checkout/${PEDIDO}`)
  })

  it('validade: no mínimo 31 minutos (a Stripe exige 30), no máximo 23 horas; o prazo entra na chave de idempotência', async () => {
    const { f, chamadas } = mockFetch({ 'POST /v1/checkout/sessions': { corpo: sessaoCriada } })
    const g = gw(f)
    await g.criarCobranca(entrada) // pedido vence em 30 min: sobe para 31
    await g.criarCobranca({ ...entrada, expiraEm: new Date(AGORA + 2 * 60 * 60_000) }) // 2 h: vale o prazo do pedido
    await g.criarCobranca({ ...entrada, expiraEm: new Date(AGORA + 48 * 60 * 60_000) }) // 48 h: corta em 23 h
    const prazos = chamadas.map((c) => Number(c.form.get('expires_at')))
    expect(prazos).toEqual([(AGORA + 31 * 60_000) / 1000, (AGORA + 2 * 60 * 60_000) / 1000, (AGORA + 23 * 60 * 60_000) / 1000])
    expect(chamadas.map((c) => c.cab.get('idempotency-key'))).toEqual(prazos.map((p) => `checkout-${PEDIDO}-${p}`))
  })

  it('segundo clique no mesmo minuto repete a mesma chave (a Stripe devolve a mesma sessão)', async () => {
    const { f, chamadas } = mockFetch({ 'POST /v1/checkout/sessions': { corpo: sessaoCriada } })
    await gw(f, AGORA + 5_000).criarCobranca(entrada)
    await gw(f, AGORA + 40_000).criarCobranca(entrada)
    expect(chamadas[0].cab.get('idempotency-key')).toBe(chamadas[1].cab.get('idempotency-key'))
  })

  it('português volta sem prefixo e abre em pt-BR; espanhol em /es', async () => {
    const { f, chamadas } = mockFetch({ 'POST /v1/checkout/sessions': { corpo: sessaoCriada } })
    await gw(f).criarCobranca({ ...entrada, idioma: 'pt' })
    await gw(f).criarCobranca({ ...entrada, idioma: 'es' })
    expect(chamadas[0].form.get('locale')).toBe('pt-BR')
    expect(chamadas[0].form.get('success_url')).toBe(`https://aguaverdeviagens.com.br/checkout/${PEDIDO}`)
    expect(chamadas[1].form.get('locale')).toBe('es')
    expect(chamadas[1].form.get('success_url')).toBe(`https://aguaverdeviagens.com.br/es/checkout/${PEDIDO}`)
  })

  it('Pix: recusa sem chamar a API; sessão sem endereço é erro', async () => {
    const { f, chamadas } = mockFetch({ 'POST /v1/checkout/sessions': { corpo: { ...sessaoCriada, url: null } } })
    await expect(gw(f).criarCobranca({ ...entrada, meio: 'pix' })).rejects.toThrow(/só cobra cartão/)
    expect(chamadas).toHaveLength(0)
    await expect(gw(f).criarCobranca(entrada)).rejects.toThrow(/sem o endereço/)
  })
})

describe('consultarPagamento', () => {
  it('sessão paga: aprovado com o valor em reais e a referência passa a ser o pagamento', async () => {
    const { f } = mockFetch({ 'GET /v1/checkout/sessions/cs_test_a1': { corpo: sessao() } })
    expect(await gw(f).consultarPagamento('cs_test_a1')).toEqual({ status: 'aprovado', valor: 212.35, gatewayRef: 'pi_test_9' })
  })

  it('sessão aberta segue pendente; expirada vira cancelado; inexistente segue pendente; 5xx sobe', async () => {
    const aberta = mockFetch({ 'GET /v1/checkout/sessions/': { corpo: sessao({ status: 'open', payment_status: 'unpaid', payment_intent: null }) } })
    expect(await gw(aberta.f).consultarPagamento('cs_test_a1')).toEqual({ status: 'pendente' })
    const expirada = mockFetch({ 'GET /v1/checkout/sessions/': { corpo: sessao({ status: 'expired', payment_status: 'unpaid', payment_intent: null }) } })
    expect(await gw(expirada.f).consultarPagamento('cs_test_a1')).toEqual({ status: 'cancelado' })
    const sumiu = mockFetch({ 'GET /v1/checkout/sessions/': erroStripe(404, 'resource_missing') })
    expect(await gw(sumiu.f).consultarPagamento('cs_test_a1')).toEqual({ status: 'pendente' })
    const fora = mockFetch({ 'GET /v1/checkout/sessions/': { status: 503, corpo: { error: { type: 'api_error', message: 'fora' } } } })
    await expect(gw(fora.f).consultarPagamento('cs_test_a1')).rejects.toBeInstanceOf(Stripe.errors.StripeError)
  })

  it('pelo pagamento (pi_): concluído é aprovado; moeda que não é real não confirma; referência estranha nem chama a API', async () => {
    const ok = mockFetch({ 'GET /v1/payment_intents/pi_test_9': { corpo: { id: 'pi_test_9', object: 'payment_intent', status: 'succeeded', currency: 'brl', amount_received: 21235 } } })
    expect(await gw(ok.f).consultarPagamento('pi_test_9')).toEqual({ status: 'aprovado', valor: 212.35 })
    const usd = mockFetch({ 'GET /v1/payment_intents/': { corpo: { id: 'pi_test_9', object: 'payment_intent', status: 'succeeded', currency: 'usd', amount_received: 21235 } } })
    expect(await gw(usd.f).consultarPagamento('pi_test_9')).toEqual({ status: 'pendente' })
    const nada = mockFetch({})
    expect(await gw(nada.f).consultarPagamento('pedido:123')).toEqual({ status: 'pendente' })
    expect(nada.chamadas).toHaveLength(0)
  })
})

describe('reembolsar', () => {
  it('reembolso total pelo pagamento, com chave de idempotência (repetir não devolve duas vezes)', async () => {
    const { f, chamadas } = mockFetch({ 'POST /v1/refunds': { corpo: { id: 're_test_1', object: 'refund', status: 'succeeded' } } })
    expect(await gw(f).reembolsar('pi_test_9')).toEqual({ ok: true, reembolsoRef: 're_test_1' })
    expect(chamadas[0].form.get('payment_intent')).toBe('pi_test_9')
    expect(chamadas[0].form.get('amount')).toBeNull()
    expect(chamadas[0].cab.get('idempotency-key')).toBe('reembolso-pi_test_9-total')
  })

  it('parcial vai em centavos; pela sessão, descobre o pagamento antes', async () => {
    const { f, chamadas } = mockFetch({
      'GET /v1/checkout/sessions/cs_test_a1': { corpo: sessao() },
      'POST /v1/refunds': { corpo: { id: 're_test_2', object: 'refund', status: 'pending' } },
    })
    expect(await gw(f).reembolsar('cs_test_a1', 100.5)).toEqual({ ok: true, reembolsoRef: 're_test_2' })
    const pedidoDeReembolso = chamadas.find((c) => c.url.includes('/v1/refunds'))
    expect(pedidoDeReembolso?.form.get('payment_intent')).toBe('pi_test_9')
    expect(pedidoDeReembolso?.form.get('amount')).toBe('10050')
    expect(pedidoDeReembolso?.cab.get('idempotency-key')).toBe('reembolso-pi_test_9-10050')
  })

  it('sessão sem pagamento: nada a devolver; já reembolsado conta como feito; outro 4xx falha; reembolso recusado falha', async () => {
    const semPagamento = mockFetch({ 'GET /v1/checkout/sessions/': { corpo: sessao({ payment_intent: null, payment_status: 'unpaid' }) } })
    expect(await gw(semPagamento.f).reembolsar('cs_test_a1')).toEqual({ ok: false })
    expect(semPagamento.chamadas.some((c) => c.url.includes('/v1/refunds'))).toBe(false)
    expect(await gw(mockFetch({ 'POST /v1/refunds': erroStripe(400, 'charge_already_refunded') }).f).reembolsar('pi_test_9')).toEqual({ ok: true })
    expect(await gw(mockFetch({ 'POST /v1/refunds': erroStripe(400, 'charge_disputed') }).f).reembolsar('pi_test_9')).toEqual({ ok: false })
    expect(await gw(mockFetch({ 'POST /v1/refunds': { corpo: { id: 're_x', object: 'refund', status: 'failed' } } }).f).reembolsar('pi_test_9')).toEqual({ ok: false })
  })

  it('Stripe fora do ar: o erro sobe (quem chamou tenta de novo)', async () => {
    const { f } = mockFetch({ 'POST /v1/refunds': { status: 503, corpo: { error: { type: 'api_error', message: 'fora' } } } })
    await expect(gw(f).reembolsar('pi_test_9')).rejects.toBeInstanceOf(Stripe.errors.StripeError)
  })
})

describe('validarWebhook', () => {
  const pago = evento('checkout.session.completed', sessao())

  it('assinatura boa: aprovado com o valor em reais, referência do pagamento e o id do evento', async () => {
    const { f, chamadas } = mockFetch({})
    expect(await gw(f).validarWebhook(pago, cabecalho(assinar(pago)))).toEqual({
      gateway: 'stripe',
      eventoId: 'evt_test_1',
      gatewayRef: 'pi_test_9',
      pedidoId: PEDIDO,
      status: 'aprovado',
      valor: 212.35,
    })
    expect(chamadas).toHaveLength(0) // o segredo é do endpoint da loja: não precisa consultar a API
  })

  it('segredo de outro endpoint, sem assinatura, corpo alterado, lixo ou aviso velho (mais de 5 min): null', async () => {
    const g = gw(mockFetch({}).f)
    expect(await g.validarWebhook(pago, cabecalho(assinar(pago, 'whsec_de_outra_conta')))).toBeNull()
    expect(await g.validarWebhook(pago, cabecalho(null))).toBeNull()
    expect(await g.validarWebhook(pago.replace('21235', '1'), cabecalho(assinar(pago)))).toBeNull()
    expect(await g.validarWebhook(pago, cabecalho('t=1,v1=abc'))).toBeNull()
    const velho = Math.floor(Date.now() / 1000) - 10 * 60
    expect(await g.validarWebhook(pago, cabecalho(assinar(pago, SEGREDO, velho)))).toBeNull()
  })

  it('pagamento assíncrono: "completed" ainda sem dinheiro é ignorado; "succeeded" confirma; "failed" fica como recusado', async () => {
    const g = gw(mockFetch({}).f)
    const semDinheiro = evento('checkout.session.completed', sessao({ payment_status: 'unpaid' }))
    expect(await g.validarWebhook(semDinheiro, cabecalho(assinar(semDinheiro)))).toBe('ignorar')
    const caiu = evento('checkout.session.async_payment_succeeded', sessao(), 'evt_test_2')
    expect(await g.validarWebhook(caiu, cabecalho(assinar(caiu)))).toMatchObject({ status: 'aprovado', eventoId: 'evt_test_2' })
    const falhou = evento('checkout.session.async_payment_failed', sessao({ payment_status: 'unpaid' }), 'evt_test_3')
    expect(await g.validarWebhook(falhou, cabecalho(assinar(falhou)))).toMatchObject({ status: 'recusado', eventoId: 'evt_test_3' })
  })

  it('outros eventos, sessão de fora da loja e moeda que não é real: ignorar', async () => {
    const g = gw(mockFetch({}).f)
    for (const corpo of [
      evento('payment_intent.succeeded', { id: 'pi_test_9', object: 'payment_intent' }),
      evento('checkout.session.expired', sessao({ status: 'expired', payment_status: 'unpaid' })),
      evento('checkout.session.completed', sessao({ client_reference_id: null })),
      evento('checkout.session.completed', sessao({ client_reference_id: 'pedido-de-outro-sistema' })),
      evento('checkout.session.completed', sessao({ currency: 'usd' })),
    ]) {
      expect(await g.validarWebhook(corpo, cabecalho(assinar(corpo)))).toBe('ignorar')
    }
  })
})

describe('configuração', () => {
  const base = { chaveSecreta: CHAVE, segredoWebhook: SEGREDO, urlBase: 'https://aguaverdeviagens.com.br' }
  it('recusa a chave publicável, chave sem prefixo, segredo sem whsec_ e endereço sem https', () => {
    expect(() => new GatewayStripe({ ...base, chaveSecreta: 'pk_test_51USEZq' })).toThrow(/publicável/)
    expect(() => new GatewayStripe({ ...base, chaveSecreta: 'qualquer-coisa' })).toThrow(/sk_test_/)
    expect(() => new GatewayStripe({ ...base, segredoWebhook: 'segredo' })).toThrow(/whsec_/)
    expect(() => new GatewayStripe({ ...base, urlBase: 'http://localhost:3000' })).toThrow(/https/)
    expect(() => new GatewayStripe(base)).not.toThrow()
  })
})
