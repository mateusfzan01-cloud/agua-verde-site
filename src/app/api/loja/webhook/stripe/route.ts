import { processarWebhook } from '@/lib/loja/fluxo'
import { dependencias, gatewayPorNome } from '@/lib/loja/servicos'

/**
 * Aviso de pagamento por cartão da Stripe. Cadastrar no painel (Desenvolvedores > Webhooks):
 * <LOJA_URL_BASE>/api/loja/webhook/stripe, eventos checkout.session.completed,
 * checkout.session.async_payment_succeeded e checkout.session.async_payment_failed; o segredo do endpoint
 * (whsec_...) vai em STRIPE_WEBHOOK_SECRET. Lê o corpo CRU (a assinatura é conferida nele) e só responde
 * 2xx depois de gravar. Erro de banco/rede devolve 500: a Stripe tenta de novo.
 */
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const gateway = gatewayPorNome('stripe')
  if (!gateway) return new Response('desligado', { status: 404 })
  const corpoCru = await req.text()
  try {
    const r = await processarWebhook(dependencias(), gateway, corpoCru, req.headers, new Date(), new URL(req.url))
    return new Response(r.corpo, { status: r.status })
  } catch (erro) {
    console.error('[loja] webhook da Stripe falhou:', erro instanceof Error ? erro.message : erro)
    return new Response('erro', { status: 500 })
  }
}
