import { processarWebhook } from '@/lib/loja/fluxo'
import { dependencias, gatewayPorNome } from '@/lib/loja/servicos'

/**
 * Webhook do gateway SIMULADO. Mostra o padrão do §4.7: lê o corpo CRU,
 * confere a assinatura nele e só então responde 2xx (depois de gravar).
 * Cada provedor tem a sua rota, que diz ao fluxo de quem é o aviso; os reais seguem a mesma forma.
 */
export async function POST(req: Request) {
  const gateway = gatewayPorNome('simulado')
  if (!gateway) return new Response('desligado', { status: 404 })
  const corpoCru = await req.text()
  const r = await processarWebhook(dependencias(), gateway, corpoCru, req.headers)
  return new Response(r.corpo, { status: r.status })
}
