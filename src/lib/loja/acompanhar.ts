import type { ItemDoPedido } from './pedidos-tipos'

/** Página pública de acompanhamento (a mesma que o app e as mensagens usam). */
export const URL_BASE_ACOMPANHAR = process.env.NEXT_PUBLIC_URL_ACOMPANHAR ?? 'https://app.aguaverde.tur.br/acompanhar'

export interface LinkDeAcompanhamento {
  ordem: number
  url: string
}

/**
 * Um link por perna que já virou viagem de verdade. O token vem da própria viagem
 * (`viagens.token_cliente`), que só existe depois do pagamento confirmado e do banco ligado.
 * Pernas sem token ficam de fora: o link nunca é inventado.
 */
export function linksDeAcompanhamento(itens: ItemDoPedido[], base = URL_BASE_ACOMPANHAR): LinkDeAcompanhamento[] {
  return itens
    .filter((i) => Boolean(i.viagemToken))
    .map((i) => ({ ordem: i.ordem, url: `${base.replace(/\/$/, '')}/${encodeURIComponent(i.viagemToken as string)}` }))
}
