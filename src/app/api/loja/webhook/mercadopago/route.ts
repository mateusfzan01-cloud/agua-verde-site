import { processarWebhook } from '@/lib/loja/fluxo'
import { dependencias, usaMercadoPago } from '@/lib/loja/servicos'

/**
 * Aviso de pagamento do Mercado Pago (cadastrar no painel: <LOJA_URL_BASE>/api/loja/webhook/mercadopago,
 * evento "Pagamentos"). Lê o corpo CRU, confere a assinatura (x-signature), consulta o pagamento na API
 * e só responde 2xx depois de gravar. Erro de banco/rede devolve 500: o Mercado Pago tenta de novo.
 */
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!usaMercadoPago()) return new Response('desligado', { status: 404 })
  const corpoCru = await req.text()
  try {
    const r = await processarWebhook(dependencias(), corpoCru, req.headers, new Date(), new URL(req.url))
    return new Response(r.corpo, { status: r.status })
  } catch (erro) {
    console.error('[loja] webhook do Mercado Pago falhou:', erro instanceof Error ? erro.message : erro)
    return new Response('erro', { status: 500 })
  }
}
