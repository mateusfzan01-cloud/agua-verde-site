/**
 * Pedido de cartão de ponta a ponta com a Stripe (rede simulada): cobrança na página hospedada, aviso
 * assinado confirma, a referência vira o pagamento e o cancelamento reembolsa por ele.
 */
import Stripe from 'stripe'
import { describe, expect, it } from 'vitest'
import { produtoPorSlug } from './catalogo'
import { cancelarPedido, iniciarPagamento, processarWebhook, type Dependencias } from './fluxo'
import { criarPedido } from './pedidos'
import { CABECALHO_ASSINATURA, GatewayStripe } from './pagamento/stripe'
import { GatewaySimulado } from './pagamento/simulado'
import { RepositorioEmMemoria } from './repositorio-memoria'

const agora = new Date('2026-12-01T12:00:00Z')
const SEGREDO = 'whsec_teste_da_loja'

function stripeSimulada() {
  const pedidos: { metodo: string; url: string; form: URLSearchParams }[] = []
  const f = (async (url: string, init: RequestInit = {}) => {
    const metodo = init.method ?? 'GET'
    pedidos.push({ metodo, url, form: new URLSearchParams((init.body as string) ?? '') })
    if (metodo === 'POST' && url.endsWith('/v1/checkout/sessions')) {
      return Response.json({ id: 'cs_test_e2e', object: 'checkout.session', url: 'https://checkout.stripe.com/c/pay/cs_test_e2e', status: 'open', payment_status: 'unpaid' })
    }
    if (metodo === 'POST' && url.endsWith('/v1/refunds')) return Response.json({ id: 're_test_e2e', object: 'refund', status: 'succeeded' })
    return Response.json({ error: { type: 'api_error', message: 'nao mockado' } }, { status: 500 })
  }) as unknown as typeof fetch
  const gateway = new GatewayStripe({ chaveSecreta: 'sk_test_x', segredoWebhook: SEGREDO, urlBase: 'https://aguaverdeviagens.com.br', fetch: f, agora: () => agora.getTime() })
  return { gateway, pedidos }
}

describe('cartão pela Stripe, de ponta a ponta', () => {
  it('cobra na página hospedada no idioma do pedido, o aviso confirma e o cancelamento reembolsa pelo pagamento', async () => {
    const repo = new RepositorioEmMemoria()
    const stripe = stripeSimulada()
    const deps: Dependencias = { repo, gateways: { pix: new GatewaySimulado(), cartao: stripe.gateway }, periodosDeAltaTemporada: [] }
    const criado = await criarPedido(repo, {
      produto: produtoPorSlug('aeroporto-recife-maragogi-ida-e-volta')!,
      idioma: 'es',
      selecao: { veiculos: { sedan_economico: 1 } },
      data: '2026-12-15',
      hora: '14:30',
      dataVolta: '2026-12-22',
      horaVolta: '10:00',
      passageiro: { nome: 'Lucía Fernández', telefone: '+54 9 11 1234-5678', email: 'lucia@exemplo.com', aceitouTermos: true, endereco: 'Pousada em Maragogi' },
      agora,
    })
    if (!criado.ok) throw new Error(criado.erros.join(','))
    const pedido = criado.pedido

    const ini = await iniciarPagamento(deps, pedido.id, 'cartao', agora)
    expect(ini).toMatchObject({ ok: true, urlDePagamento: 'https://checkout.stripe.com/c/pay/cs_test_e2e' })
    const sessao = stripe.pedidos[0].form
    expect(sessao.get('locale')).toBe('es')
    expect(sessao.get('line_items[0][price_data][unit_amount]')).toBe(String(Math.round(pedido.valorTotal * 100)))
    expect(sessao.get('success_url')).toBe(`https://aguaverdeviagens.com.br/es/checkout/${pedido.id}`)
    expect((await repo.buscarPorId(pedido.id))?.gateway).toBe('stripe')

    const corpo = JSON.stringify({
      id: 'evt_test_e2e',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_e2e', object: 'checkout.session', client_reference_id: pedido.id, currency: 'brl',
          amount_total: Math.round(pedido.valorTotal * 100), status: 'complete', payment_status: 'paid', payment_intent: 'pi_test_e2e',
        },
      },
    })
    const assinatura = new Stripe('sk_test_x').webhooks.generateTestHeaderString({ payload: corpo, secret: SEGREDO })
    const cab = { get: (n: string) => (n.toLowerCase() === CABECALHO_ASSINATURA ? assinatura : null) }
    expect(await processarWebhook(deps, stripe.gateway, corpo, cab, agora)).toEqual({ status: 200, corpo: 'ok' })
    expect(await processarWebhook(deps, stripe.gateway, corpo, cab, agora)).toEqual({ status: 200, corpo: 'duplicado' })
    const pago = await repo.buscarPorId(pedido.id)
    expect(pago).toMatchObject({ status: 'pago', gatewayRef: 'pi_test_e2e' })

    const cancelado = await cancelarPedido(deps, pedido.tokenAcesso, new Date(agora.getTime() + 60 * 60_000))
    expect(cancelado).toEqual({ ok: true, motivo: 'arrependimento' })
    const reembolso = stripe.pedidos.find((p) => p.url.endsWith('/v1/refunds'))
    expect(reembolso?.form.get('payment_intent')).toBe('pi_test_e2e')
    expect((await repo.buscarPorId(pedido.id))?.status).toBe('reembolsado')
  })
})
