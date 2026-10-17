import { processarWebhook } from '@/lib/loja/fluxo'
import { dependencias } from '@/lib/loja/servicos'

/**
 * Webhook do gateway SIMULADO. Mostra o padrão do §4.7: lê o corpo CRU,
 * confere a assinatura nele e só então responde 2xx (depois de gravar).
 * O webhook do Mercado Pago (etapa C) segue a mesma forma.
 */
export async function POST(req: Request) {
  const corpoCru = await req.text()
  const r = await processarWebhook(dependencias(), corpoCru, req.headers)
  return new Response(r.corpo, { status: r.status })
}
