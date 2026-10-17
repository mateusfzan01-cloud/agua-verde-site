import { describe, expect, it } from 'vitest'
import { assinaturaDeTeste, ErroMercadoPago, GatewayMercadoPago, mapearStatus } from './mercadopago'

const PEDIDO = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b'
const SEGREDO = 'segredo-de-teste'

interface Chamada { url: string; metodo: string; cab: Record<string, string>; corpo: unknown }

function mockFetch(respostas: Record<string, { status?: number; corpo: unknown }>) {
  const chamadas: Chamada[] = []
  const f = (async (url: string, init: RequestInit) => {
    chamadas.push({ url, metodo: init.method ?? 'GET', cab: init.headers as Record<string, string>, corpo: init.body ? JSON.parse(init.body as string) : undefined })
    const chave = Object.keys(respostas).find((k) => url.includes(k))
    if (!chave) return new Response('nao mockado', { status: 500 })
    const r = respostas[chave]
    return new Response(JSON.stringify(r.corpo), { status: r.status ?? 200 })
  }) as unknown as typeof fetch
  return { f, chamadas }
}

const gw = (f: typeof fetch, token = 'APP_USR-123') =>
  new GatewayMercadoPago({ accessToken: token, segredoWebhook: SEGREDO, urlBase: 'https://loja.exemplo.com', fetch: f })

const entrada = { pedidoId: PEDIDO, valor: 740.005, meio: 'pix' as const, descricao: 'Água Verde AV-2026-000007', pagador: { nome: 'Lucía Fernández Gómez', email: 'l@x.com', telefone: '+5491112345678', cpf: '123.456.789-09' } }

describe('mapearStatus', () => {
  it('traduz os estados do Mercado Pago', () => {
    expect(mapearStatus('approved')).toBe('aprovado')
    expect(mapearStatus('pending')).toBe('pendente')
    expect(mapearStatus('in_process')).toBe('pendente')
    expect(mapearStatus('rejected')).toBe('recusado')
    expect(mapearStatus('cancelled')).toBe('cancelado')
    expect(mapearStatus('refunded')).toBe('reembolsado')
    expect(mapearStatus('charged_back')).toBe('reembolsado')
    expect(mapearStatus(undefined)).toBe('pendente')
  })
})

describe('criarCobranca', () => {
  it('Pix: idempotência pelo pedido, valor arredondado, referência, aviso e CPF', async () => {
    const { f, chamadas } = mockFetch({ '/v1/payments': { corpo: { id: 987, status: 'pending', point_of_interaction: { transaction_data: { qr_code: '000201PIX' } } } } })
    const c = await gw(f).criarCobranca(entrada)
    expect(c).toEqual({ gatewayRef: '987', status: 'pendente', pix: { copiaECola: '000201PIX' } })
    const [req] = chamadas
    expect(req.metodo).toBe('POST')
    expect(req.cab['X-Idempotency-Key']).toBe(`pix-${PEDIDO}`)
    expect(req.cab.Authorization).toBe('Bearer APP_USR-123')
    const b = req.corpo as Record<string, any>
    expect(b.transaction_amount).toBe(740.01)
    expect(b.payment_method_id).toBe('pix')
    expect(b.external_reference).toBe(PEDIDO)
    expect(b.notification_url).toBe('https://loja.exemplo.com/api/loja/webhook/mercadopago')
    expect(b.payer).toMatchObject({ email: 'l@x.com', first_name: 'Lucía', last_name: 'Fernández Gómez', identification: { type: 'CPF', number: '12345678909' } })
    expect(Date.parse(b.date_of_expiration)).toBeGreaterThan(Date.now() + 30 * 60_000)
  })

  it('Pix sem CPF válido não manda identificação', async () => {
    const { f, chamadas } = mockFetch({ '/v1/payments': { corpo: { id: 1, status: 'pending', point_of_interaction: { transaction_data: { qr_code: 'x' } } } } })
    await gw(f).criarCobranca({ ...entrada, pagador: { ...entrada.pagador, cpf: '123' } })
    expect((chamadas[0].corpo as any).payer.identification).toBeUndefined()
  })

  it('Pix sem qr_code na resposta é erro (nunca mostra cobrança vazia)', async () => {
    const { f } = mockFetch({ '/v1/payments': { corpo: { id: 1, status: 'pending' } } })
    await expect(gw(f).criarCobranca(entrada)).rejects.toBeInstanceOf(ErroMercadoPago)
  })

  it('cartão: preferência com referência do pedido; link de teste só com credencial de teste', async () => {
    const resp = { '/checkout/preferences': { corpo: { id: 'pref1', init_point: 'https://mp/real', sandbox_init_point: 'https://mp/sandbox' } } }
    const real = mockFetch(resp)
    const c = await gw(real.f).criarCobranca({ ...entrada, meio: 'cartao' })
    expect(c).toEqual({ gatewayRef: `pedido:${PEDIDO}`, status: 'pendente', urlDePagamento: 'https://mp/real' })
    expect((real.chamadas[0].corpo as any).external_reference).toBe(PEDIDO)
    expect((real.chamadas[0].corpo as any).back_urls.success).toBe(`https://loja.exemplo.com/checkout/${PEDIDO}`)
    const teste = mockFetch(resp)
    expect((await gw(teste.f, 'TEST-abc').criarCobranca({ ...entrada, meio: 'cartao' })).urlDePagamento).toBe('https://mp/sandbox')
  })

  it('erro do Mercado Pago sobe como ErroMercadoPago com o status', async () => {
    const { f } = mockFetch({ '/v1/payments': { status: 400, corpo: { message: 'ruim' } } })
    await expect(gw(f).criarCobranca(entrada)).rejects.toMatchObject({ status: 400 })
  })
})

describe('consultarPagamento', () => {
  it('por id: traduz o status e devolve o valor', async () => {
    const { f } = mockFetch({ '/v1/payments/987': { corpo: { status: 'approved', transaction_amount: 740 } } })
    expect(await gw(f).consultarPagamento('987')).toEqual({ status: 'aprovado', valor: 740 })
  })

  it('cartão (pedido:<id>): procura pelo external_reference e devolve o id do pagamento aprovado', async () => {
    const { f, chamadas } = mockFetch({ '/v1/payments/search': { corpo: { results: [{ id: 5, status: 'rejected', transaction_amount: 740 }, { id: 6, status: 'approved', transaction_amount: 740 }] } } })
    expect(await gw(f).consultarPagamento(`pedido:${PEDIDO}`)).toEqual({ status: 'aprovado', valor: 740, gatewayRef: '6' })
    expect(chamadas[0].url).toContain(`external_reference=${PEDIDO}`)
  })

  it('cartão sem pagamento aprovado segue pendente; referência estranha nem chama a API', async () => {
    const { f, chamadas } = mockFetch({ '/v1/payments/search': { corpo: { results: [{ id: 5, status: 'rejected', transaction_amount: 1 }] } } })
    expect((await gw(f).consultarPagamento(`pedido:${PEDIDO}`)).status).toBe('pendente')
    expect((await gw(f).consultarPagamento('pedido:../../x')).status).toBe('pendente')
    expect((await gw(f).consultarPagamento('abc')).status).toBe('pendente')
    expect(chamadas).toHaveLength(1)
  })
})

describe('reembolsar', () => {
  it('reembolso total com idempotência; recusa 4xx vira ok:false; 5xx sobe', async () => {
    const ok = mockFetch({ '/refunds': { status: 201, corpo: { id: 77 } } })
    expect(await gw(ok.f).reembolsar('987')).toEqual({ ok: true, reembolsoRef: '77' })
    expect(ok.chamadas[0].cab['X-Idempotency-Key']).toBe('reembolso-987-total')
    expect(ok.chamadas[0].corpo).toEqual({})
    const parcial = mockFetch({ '/refunds': { status: 201, corpo: { id: 78 } } })
    await gw(parcial.f).reembolsar('987', 100)
    expect(parcial.chamadas[0].corpo).toEqual({ amount: 100 })
    expect(await gw(mockFetch({ '/refunds': { status: 400, corpo: {} } }).f).reembolsar('987')).toEqual({ ok: false })
    await expect(gw(mockFetch({ '/refunds': { status: 503, corpo: {} } }).f).reembolsar('987')).rejects.toBeInstanceOf(ErroMercadoPago)
  })

  it('referência de cartão ainda sem pagamento não chama a API', async () => {
    const { f, chamadas } = mockFetch({})
    expect(await gw(f).reembolsar(`pedido:${PEDIDO}`)).toEqual({ ok: false })
    expect(chamadas).toHaveLength(0)
  })
})

describe('validarWebhook', () => {
  const corpo = JSON.stringify({ action: 'payment.updated', type: 'payment', data: { id: '987' } })
  const url = new URL('https://loja.exemplo.com/api/loja/webhook/mercadopago?data.id=987&type=payment')
  const cab = (assinatura: string | null, requestId: string | null = 'req-1') => ({
    get: (n: string) => (n === 'x-signature' ? assinatura : n === 'x-request-id' ? requestId : null),
  })
  const pagamento = (over: Record<string, unknown> = {}) => ({ '/v1/payments/987': { corpo: { id: 987, status: 'approved', external_reference: PEDIDO, transaction_amount: 740, ...over } } })

  it('assinatura boa: consulta o pagamento e devolve o evento com o estado da API (não o do aviso)', async () => {
    const { f, chamadas } = mockFetch(pagamento())
    const e = await gw(f).validarWebhook(corpo, cab(assinaturaDeTeste(SEGREDO, '987', 'req-1')), url)
    expect(e).toEqual({ eventoId: 'mp_987_approved', gatewayRef: '987', pedidoId: PEDIDO, status: 'aprovado', valor: 740 })
    expect(chamadas[0].url).toContain('/v1/payments/987')
  })

  it('assinatura errada, ausente ou de outro segredo: null, e nem consulta a API', async () => {
    const { f, chamadas } = mockFetch(pagamento())
    expect(await gw(f).validarWebhook(corpo, cab(assinaturaDeTeste('outro-segredo', '987', 'req-1')), url)).toBeNull()
    expect(await gw(f).validarWebhook(corpo, cab(null), url)).toBeNull()
    expect(await gw(f).validarWebhook(corpo, cab('ts=1,v1=zzz'), url)).toBeNull()
    expect(await gw(f).validarWebhook(corpo, cab(assinaturaDeTeste(SEGREDO, '987', 'req-OUTRO')), url)).toBeNull() // x-request-id diferente
    expect(await gw(f).validarWebhook(corpo, cab(assinaturaDeTeste(SEGREDO, '111', 'req-1')), url)).toBeNull() // id de outro pagamento
    expect(await gw(f).validarWebhook('não é json', cab(assinaturaDeTeste(SEGREDO, '987', 'req-1')), url)).toBeNull()
    expect(chamadas).toHaveLength(0)
  })

  it('aviso que não é de pagamento, pagamento desconhecido ou de fora da loja: ignorar', async () => {
    const outro = JSON.stringify({ type: 'merchant_order', data: { id: '987' } })
    const sig = cab(assinaturaDeTeste(SEGREDO, '987', 'req-1'))
    expect(await gw(mockFetch(pagamento()).f).validarWebhook(outro, sig, url)).toBe('ignorar')
    expect(await gw(mockFetch({ '/v1/payments/987': { status: 404, corpo: {} } }).f).validarWebhook(corpo, sig, url)).toBe('ignorar')
    expect(await gw(mockFetch(pagamento({ external_reference: 'outro-sistema-123' })).f).validarWebhook(corpo, sig, url)).toBe('ignorar')
    expect(await gw(mockFetch(pagamento({ external_reference: undefined })).f).validarWebhook(corpo, sig, url)).toBe('ignorar')
  })

  it('falha do Mercado Pago ao consultar sobe o erro (o aviso volta a ser tentado)', async () => {
    const sig = cab(assinaturaDeTeste(SEGREDO, '987', 'req-1'))
    await expect(gw(mockFetch({ '/v1/payments/987': { status: 502, corpo: {} } }).f).validarWebhook(corpo, sig, url)).rejects.toBeInstanceOf(ErroMercadoPago)
  })

  it('sem data.id na URL usa o do corpo; estados diferentes geram eventos diferentes', async () => {
    const sig = cab(assinaturaDeTeste(SEGREDO, '987', 'req-1'))
    const e1 = await gw(mockFetch(pagamento({ status: 'pending' })).f).validarWebhook(corpo, sig)
    const e2 = await gw(mockFetch(pagamento({ status: 'refunded' })).f).validarWebhook(corpo, sig)
    expect(e1).toMatchObject({ eventoId: 'mp_987_pending', status: 'pendente' })
    expect(e2).toMatchObject({ eventoId: 'mp_987_refunded', status: 'reembolsado' })
  })
})
