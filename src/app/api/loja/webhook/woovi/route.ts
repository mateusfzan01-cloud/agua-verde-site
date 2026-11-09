import { processarWebhook } from '@/lib/loja/fluxo'
import { dependencias, gatewayPorNome } from '@/lib/loja/servicos'

/**
 * Aviso de Pix da Woovi (cadastrar no painel: <LOJA_URL_BASE>/api/loja/webhook/woovi, eventos
 * OPENPIX:CHARGE_COMPLETED e OPENPIX:CHARGE_EXPIRED). Lê o corpo CRU, confere a assinatura
 * (x-webhook-signature, RSA-SHA256 com a chave pública da Woovi) e só responde 2xx depois de gravar.
 * Erro de banco/rede devolve 500: a Woovi tenta de novo.
 */
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const gateway = gatewayPorNome('woovi')
  if (!gateway) return new Response('desligado', { status: 404 })
  const corpoCru = await req.text()
  try {
    const r = await processarWebhook(dependencias(), gateway, corpoCru, req.headers, new Date(), new URL(req.url))
    return new Response(r.corpo, { status: r.status })
  } catch (erro) {
    console.error('[loja] webhook da Woovi falhou:', erro instanceof Error ? erro.message : erro)
    return new Response('erro', { status: 500 })
  }
}
