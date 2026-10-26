import { createSign, generateKeyPairSync } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { CABECALHO_ASSINATURA, centavos, ErroWoovi, GatewayWoovi, HOST_SANDBOX, mapearStatus } from './woovi'

const PEDIDO = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b'
const AGORA = Date.parse('2026-12-01T12:00:00Z')

const novoParDeChaves = () =>
  generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } })
const atual = novoParDeChaves()
const outra = novoParDeChaves()

const assinar = (corpo: string, chavePrivada = atual.privateKey) => createSign('sha256').update(corpo).sign(chavePrivada, 'base64')

interface Chamada { url: string; metodo: string; cab: Record<string, string>; corpo: unknown }
type Resposta = { status?: number; corpo: unknown } | (() => { status?: number; corpo: unknown })

function mockFetch(respostas: Record<string, Resposta>) {
  const chamadas: Chamada[] = []
  const f = (async (url: string, init: RequestInit = {}) => {
    chamadas.push({ url, metodo: init.method ?? 'GET', cab: (init.headers ?? {}) as Record<string, string>, corpo: init.body ? JSON.parse(init.body as string) : undefined })
    const chave = Object.keys(respostas).find((k) => url.includes(k))
    if (!chave) return new Response('nao mockado', { status: 500 })
    const r = typeof respostas[chave] === 'function' ? (respostas[chave] as () => { status?: number; corpo: unknown })() : (respostas[chave] as { status?: number; corpo: unknown })
    return new Response(JSON.stringify(r.corpo), { status: r.status ?? 200 })
  }) as unknown as typeof fetch
  return { f, chamadas }
}

interface CorpoDaCobranca {
  correlationID: string
  value: number
  expiresIn: number
  comment: string
  customer: { name: string; email: string; taxID?: string }
}

/** Como a cobrança aparece na conta da loja (consulta que o webhook faz antes de aceitar o aviso). */
const naConta = (status: string, value = 74001) => ({ [`/api/v1/charge/${PEDIDO}`]: { corpo: { charge: { correlationID: PEDIDO, value, status } } } })
const buscasDeChave = (chamadas: Chamada[]) => chamadas.filter((c) => c.url.includes('/webhook/public-keys')).length

const chavesPublicas = (...pems: string[]) => ({ corpo: { public_keys: pems.map((key, i) => ({ key, key_identifier: `k${i}`, is_current: i === 0 })) } })

function gw(f: typeof fetch, relogio = { t: AGORA }) {
  return new GatewayWoovi({ appId: 'APP-ID-DE-TESTE', fetch: f, agora: () => relogio.t })
}

const entrada = {
  pedidoId: PEDIDO,
  valor: 740.01,
  meio: 'pix' as const,
  descricao: 'Água Verde AV-2026-000007',
  pagador: { nome: 'Lucía Fernández Gómez', email: 'l@x.com', telefone: '+5491112345678', cpf: '123.456.789-09' },
  expiraEm: new Date(AGORA + 30 * 60_000),
}

const cabecalho = (assinatura: string | null) => ({ get: (n: string) => (n.toLowerCase() === CABECALHO_ASSINATURA ? assinatura : null) })

describe('mapearStatus e centavos', () => {
  it('traduz os estados da Woovi', () => {
    expect(mapearStatus('ACTIVE')).toBe('pendente')
    expect(mapearStatus('COMPLETED')).toBe('aprovado')
    expect(mapearStatus('EXPIRED')).toBe('cancelado')
    expect(mapearStatus(undefined)).toBe('pendente')
  })

  it('converte reais em centavos sem erro de ponto flutuante', () => {
    expect(centavos(350)).toBe(35000)
    expect(centavos(212.35)).toBe(21235)
    expect(centavos(0.1 + 0.2)).toBe(30)
    expect(centavos(740.01)).toBe(74001)
  })
})

describe('criarCobranca', () => {
  const resposta = { '/api/v1/charge': { corpo: { charge: { correlationID: PEDIDO, value: 74001, status: 'ACTIVE', brCode: '000201WOOVI' }, brCode: '000201WOOVI', correlationID: PEDIDO } } }

  it('Pix: idempotência pelo pedido, centavos, validade do pedido, AppID e cliente com CPF', async () => {
    const { f, chamadas } = mockFetch(resposta)
    const c = await gw(f).criarCobranca(entrada)
    expect(c).toEqual({ gatewayRef: PEDIDO, status: 'pendente', pix: { copiaECola: '000201WOOVI' } })
    const [req] = chamadas
    expect(req.url).toBe(`${HOST_SANDBOX}/api/v1/charge?return_existing=true`)
    expect(req.metodo).toBe('POST')
    expect(req.cab.Authorization).toBe('APP-ID-DE-TESTE') // AppID direto, sem "Bearer"
    const b = req.corpo as CorpoDaCobranca
    expect(b.correlationID).toBe(PEDIDO)
    expect(b.value).toBe(74001)
    expect(b.expiresIn).toBe(30 * 60)
    expect(b.comment).toBe('Água Verde AV-2026-000007')
    expect(b.customer).toEqual({ name: 'Lucía Fernández Gómez', email: 'l@x.com', taxID: '12345678909' })
  })

  it('validade nunca abaixo de 5 minutos; sem CPF válido não manda taxID; comentário cortado em 140', async () => {
    const { f, chamadas } = mockFetch(resposta)
    await gw(f).criarCobranca({ ...entrada, expiraEm: new Date(AGORA - 60_000), pagador: { ...entrada.pagador, cpf: '123' }, descricao: 'x'.repeat(300) })
    const b = chamadas[0].corpo as CorpoDaCobranca
    expect(b.expiresIn).toBe(300)
    expect(b.customer.taxID).toBeUndefined()
    expect(b.comment).toHaveLength(140)
  })

  it('cartão: recusa sem chamar a API (a Woovi só cobra Pix)', async () => {
    const { f, chamadas } = mockFetch(resposta)
    await expect(gw(f).criarCobranca({ ...entrada, meio: 'cartao' })).rejects.toThrow(/só cobra Pix/)
    expect(chamadas).toHaveLength(0)
  })

  it('resposta sem brCode é erro (nunca mostra cobrança vazia); erro da API sobe com o status', async () => {
    await expect(gw(mockFetch({ '/api/v1/charge': { corpo: { charge: { status: 'ACTIVE' } } } }).f).criarCobranca(entrada)).rejects.toBeInstanceOf(ErroWoovi)
    await expect(gw(mockFetch({ '/api/v1/charge': { status: 400, corpo: { error: 'ruim' } } }).f).criarCobranca(entrada)).rejects.toMatchObject({ status: 400 })
  })
})

describe('consultarPagamento', () => {
  it('traduz o estado e devolve o valor em reais', async () => {
    const { f, chamadas } = mockFetch({ [`/api/v1/charge/${PEDIDO}`]: { corpo: { charge: { status: 'COMPLETED', value: 74001 } } } })
    expect(await gw(f).consultarPagamento(PEDIDO)).toEqual({ status: 'aprovado', valor: 740.01 })
    expect(chamadas[0].cab.Authorization).toBe('APP-ID-DE-TESTE')
  })

  it('expirada vira cancelado; 404 segue pendente; 5xx sobe; referência estranha nem chama a API', async () => {
    expect((await gw(mockFetch({ [`/charge/${PEDIDO}`]: { corpo: { charge: { status: 'EXPIRED', value: 1 } } } }).f).consultarPagamento(PEDIDO)).status).toBe('cancelado')
    expect(await gw(mockFetch({ [`/charge/${PEDIDO}`]: { status: 404, corpo: {} } }).f).consultarPagamento(PEDIDO)).toEqual({ status: 'pendente' })
    await expect(gw(mockFetch({ [`/charge/${PEDIDO}`]: { status: 503, corpo: {} } }).f).consultarPagamento(PEDIDO)).rejects.toBeInstanceOf(ErroWoovi)
    const { f, chamadas } = mockFetch({})
    expect((await gw(f).consultarPagamento('../../x')).status).toBe('pendente')
    expect(chamadas).toHaveLength(0)
  })
})

describe('reembolsar', () => {
  it('Pix é reembolsado à mão pelo painel (decisão 33): devolve ok:false sem chamar a API', async () => {
    const { f, chamadas } = mockFetch({})
    expect(await gw(f).reembolsar()).toEqual({ ok: false })
    expect(chamadas).toHaveLength(0)
  })
})

describe('validarWebhook', () => {
  const pago = JSON.stringify({ event: 'OPENPIX:CHARGE_COMPLETED', charge: { correlationID: PEDIDO, value: 74001, status: 'COMPLETED', transactionID: 'd983a0' }, pix: { endToEndId: 'E123', value: 74001 } })

  it('assinatura boa: confere a cobrança na conta da loja e devolve aprovado com o valor em reais', async () => {
    const { f, chamadas } = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey), ...naConta('COMPLETED') })
    expect(await gw(f).validarWebhook(pago, cabecalho(assinar(pago)))).toEqual({
      gateway: 'woovi',
      eventoId: `woovi_${PEDIDO}_aprovado`,
      gatewayRef: PEDIDO,
      pedidoId: PEDIDO,
      status: 'aprovado',
      valor: 740.01,
    })
    const consulta = chamadas.find((c) => c.url === `${HOST_SANDBOX}/api/v1/charge/${PEDIDO}`)
    expect(consulta?.metodo).toBe('GET')
    expect(consulta?.cab.Authorization).toBe('APP-ID-DE-TESTE')
  })

  it('aviso bem assinado de cobrança paga em OUTRA conta da Woovi não confirma o pedido', async () => {
    // A outra conta usou o id do nosso pedido como correlationID e pagou a si mesma.
    const aberta = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey), ...naConta('ACTIVE') })
    expect(await gw(aberta.f).validarWebhook(pago, cabecalho(assinar(pago)))).toBe('ignorar')
    const inexistente = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey), [`/api/v1/charge/${PEDIDO}`]: { status: 404, corpo: {} } })
    expect(await gw(inexistente.f).validarWebhook(pago, cabecalho(assinar(pago)))).toBe('ignorar')
  })

  it('o valor vem da conta da loja, não do aviso; API fora do ar faz a Woovi tentar de novo', async () => {
    const umCentavo = JSON.stringify({ event: 'OPENPIX:CHARGE_COMPLETED', charge: { correlationID: PEDIDO, value: 1, status: 'COMPLETED' } })
    const { f } = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey), ...naConta('COMPLETED', 74001) })
    expect(await gw(f).validarWebhook(umCentavo, cabecalho(assinar(umCentavo)))).toMatchObject({ status: 'aprovado', valor: 740.01 })
    const fora = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey), [`/api/v1/charge/${PEDIDO}`]: { status: 503, corpo: {} } })
    await expect(gw(fora.f).validarWebhook(pago, cabecalho(assinar(pago)))).rejects.toBeInstanceOf(ErroWoovi)
  })

  it('assinatura de outra chave, ausente, ou corpo alterado depois de assinado: null', async () => {
    const { f } = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey), ...naConta('COMPLETED') })
    const g = gw(f)
    expect(await g.validarWebhook(pago, cabecalho(assinar(pago, outra.privateKey)))).toBeNull()
    expect(await g.validarWebhook(pago, cabecalho(null))).toBeNull()
    expect(await g.validarWebhook(pago.replace('74001', '1'), cabecalho(assinar(pago)))).toBeNull()
    expect(await g.validarWebhook(pago, cabecalho('não é base64 de assinatura'))).toBeNull()
  })

  it('cobrança expirada vira cancelado; outros eventos e cobrança de fora da loja: ignorar sem consultar a API', async () => {
    const expirada = JSON.stringify({ event: 'OPENPIX:CHARGE_EXPIRED', charge: { correlationID: PEDIDO, value: 74001, status: 'EXPIRED' } })
    const exp = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey), ...naConta('EXPIRED') })
    expect(await gw(exp.f).validarWebhook(expirada, cabecalho(assinar(expirada)))).toMatchObject({ status: 'cancelado', eventoId: `woovi_${PEDIDO}_cancelado` })
    const { f, chamadas } = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey) })
    const g = gw(f)
    for (const corpo of [
      JSON.stringify({ event: 'OPENPIX:CHARGE_CREATED', charge: { correlationID: PEDIDO } }),
      JSON.stringify({ event: 'PIX_TRANSACTION_REFUND_SENT_CONFIRMED', charge: { correlationID: PEDIDO } }),
      JSON.stringify({ evento: 'teste_webhook' }),
      JSON.stringify({ event: 'OPENPIX:CHARGE_COMPLETED', charge: { correlationID: 'pedido-de-outro-sistema', value: 1 } }),
    ]) {
      expect(await g.validarWebhook(corpo, cabecalho(assinar(corpo)))).toBe('ignorar')
    }
    expect(chamadas.filter((c) => c.url.includes('/api/v1/charge/'))).toHaveLength(0)
  })

  it('pago por outra pessoa também confirma (o dinheiro entrou), com o mesmo id de evento do pago normal', async () => {
    const { f } = mockFetch({ '/webhook/public-keys': chavesPublicas(atual.publicKey), ...naConta('COMPLETED') })
    const corpo = JSON.stringify({ event: 'OPENPIX:CHARGE_COMPLETED_NOT_SAME_CUSTOMER_PAYER', charge: { correlationID: PEDIDO, value: 74001 } })
    expect(await gw(f).validarWebhook(corpo, cabecalho(assinar(corpo)))).toMatchObject({ status: 'aprovado', valor: 740.01, eventoId: `woovi_${PEDIDO}_aprovado` })
  })

  it('guarda as chaves por 1 hora (não busca a cada aviso) e aceita qualquer chave da lista', async () => {
    const { f, chamadas } = mockFetch({ '/webhook/public-keys': chavesPublicas(outra.publicKey, atual.publicKey), ...naConta('COMPLETED') })
    const relogio = { t: AGORA }
    const g = gw(f, relogio)
    for (let i = 0; i < 3; i++) expect(await g.validarWebhook(pago, cabecalho(assinar(pago)))).toMatchObject({ status: 'aprovado' })
    expect(buscasDeChave(chamadas)).toBe(1)
    relogio.t += 61 * 60_000
    await g.validarWebhook(pago, cabecalho(assinar(pago)))
    expect(buscasDeChave(chamadas)).toBe(2)
  })

  it('troca de chave na Woovi: assinatura nova busca a lista de novo, no máximo a cada 5 minutos', async () => {
    let lista = chavesPublicas(outra.publicKey) // só a chave velha publicada
    const { f, chamadas } = mockFetch({ '/webhook/public-keys': () => lista, ...naConta('COMPLETED') })
    const relogio = { t: AGORA }
    const g = gw(f, relogio)
    expect(await g.validarWebhook(pago, cabecalho(assinar(pago)))).toBeNull()
    lista = chavesPublicas(atual.publicKey, outra.publicKey) // a Woovi publicou a nova
    relogio.t += 60_000 // 1 minuto depois: ainda não busca de novo
    expect(await g.validarWebhook(pago, cabecalho(assinar(pago)))).toBeNull()
    expect(buscasDeChave(chamadas)).toBe(1)
    relogio.t += 5 * 60_000
    expect(await g.validarWebhook(pago, cabecalho(assinar(pago)))).toMatchObject({ status: 'aprovado' })
    expect(buscasDeChave(chamadas)).toBe(2)
  })

  it('chave em base64 do PEM (formato do exemplo da documentação) também vale', async () => {
    const { f } = mockFetch({ '/webhook/public-keys': chavesPublicas(Buffer.from(atual.publicKey).toString('base64')), ...naConta('COMPLETED') })
    expect(await gw(f).validarWebhook(pago, cabecalho(assinar(pago)))).toMatchObject({ status: 'aprovado' })
  })

  it('falha ao buscar as chaves: sem nenhuma guardada, o erro sobe (a Woovi tenta de novo); com chaves guardadas, segue com elas', async () => {
    await expect(gw(mockFetch({ '/webhook/public-keys': { status: 503, corpo: {} } }).f).validarWebhook(pago, cabecalho(assinar(pago)))).rejects.toBeInstanceOf(ErroWoovi)
    let fora = false
    const { f } = mockFetch({ '/webhook/public-keys': () => (fora ? { status: 503, corpo: {} } : chavesPublicas(atual.publicKey)), ...naConta('COMPLETED') })
    const relogio = { t: AGORA }
    const g = gw(f, relogio)
    expect(await g.validarWebhook(pago, cabecalho(assinar(pago)))).toMatchObject({ status: 'aprovado' })
    fora = true
    relogio.t += 2 * 60 * 60_000 // chaves vencidas e a lista de chaves fora do ar
    expect(await g.validarWebhook(pago, cabecalho(assinar(pago)))).toMatchObject({ status: 'aprovado' })
  })
})

describe('configuração', () => {
  it('endereço da API sem https é recusado', () => {
    expect(() => new GatewayWoovi({ appId: 'x', urlApi: 'http://api.woovi.com' })).toThrow(/https/)
  })
})
