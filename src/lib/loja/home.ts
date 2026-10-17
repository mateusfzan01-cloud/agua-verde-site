/**
 * Dados da home da loja: rotas da busca, "mais reservados" e destaques.
 * Tudo sai do catálogo (docs/loja/conteudo); só a ordem dos mais reservados é escolhida à mão
 * (a mesma do protótipo aprovado, que seguia o selo de mais vendidos da Paytour).
 */
import { produtoPorSlug, produtosPorTipo } from './catalogo'
import { precoAPartirDe } from './precos'
import type { Produto, TipoProduto } from './tipos'

/** Número mostrado no contador. Fixo e atualizado à mão até existir a função de leitura no banco (decisão 37, etapa C). */
export const VIAGENS_REALIZADAS = 8211
/** Só vira true quando o contador for lido do banco a cada hora. Enquanto for false, a home não promete atualização. */
export const CONTADOR_ATUALIZA_SOZINHO = false

/** Nota e quantidade de avaliações do Tripadvisor (plano §7). Conferir antes de publicar. */
export const TRIPADVISOR = { nota: '4,7', avaliacoes: 112 }

export interface RotaDaBusca {
  origem: string
  destino: string
  ida: { slug: string; preco: number } | null
  idaVolta: { slug: string; preco: number } | null
}

/** Pares origem → destino dos transfers à venda, com o preço de ida e o de ida e volta (quando existem). */
export function rotasDaBusca(): RotaDaBusca[] {
  const mapa = new Map<string, RotaDaBusca>()
  for (const p of produtosPorTipo('transfer')) {
    const chave = `${p.origemPadrao}|${p.destinoPadrao}`
    const rota = mapa.get(chave) ?? { origem: p.origemPadrao, destino: p.destinoPadrao, ida: null, idaVolta: null }
    const info = { slug: p.slug, preco: precoAPartirDe(p) }
    if (p.sentido === 'ida_volta') rota.idaVolta = info
    else rota.ida = info
    mapa.set(chave, rota)
  }
  return [...mapa.values()]
}

export interface ItemMaisReservado {
  slug: string
  tipo: TipoProduto
  /** Posição no ranking de mais vendidos (só os primeiros). */
  rank?: number
  produto: Produto
}

const MAIS_RESERVADOS: Record<TipoProduto, { slug: string; rank?: number }[]> = {
  transfer: [
    { slug: 'aeroporto-recife-japaratinga-ida', rank: 1 },
    { slug: 'aeroporto-recife-joao-pessoa-cabedelo-ida', rank: 2 },
    { slug: 'aeroporto-recife-porto-de-galinhas-ida', rank: 3 },
    { slug: 'aeroporto-recife-praia-dos-carneiros-ida' },
    { slug: 'aeroporto-recife-maragogi-ida-e-volta' },
  ],
  passeio: [
    { slug: 'city-tour-recife-olinda' },
    { slug: 'passeio-praia-dos-carneiros' },
    { slug: 'passeio-porto-de-galinhas-piscinas-naturais' },
    { slug: 'catamara-recife-com-transfer' },
  ],
}

export function maisReservados(tipo: TipoProduto): ItemMaisReservado[] {
  return MAIS_RESERVADOS[tipo].flatMap(({ slug, rank }) => {
    const produto = produtoPorSlug(slug, tipo)
    return produto ? [{ slug, tipo, rank, produto }] : []
  })
}

/**
 * Slides do carrossel "Em destaque". São produtos de verdade, sem desconto inventado:
 * promoção só entra aqui quando existir preço promocional no plano e no banco.
 */
const SLIDES_DESTAQUE: { slug: string; tipo: TipoProduto }[] = [
  { slug: 'city-tour-recife-olinda', tipo: 'passeio' },
  { slug: 'aeroporto-recife-porto-de-galinhas-ida', tipo: 'transfer' },
  { slug: 'aeroporto-recife-maragogi-ida-e-volta', tipo: 'transfer' },
  { slug: 'catamara-recife-com-transfer', tipo: 'passeio' },
]

export function slidesDeDestaque(): { tipo: TipoProduto; produto: Produto }[] {
  return SLIDES_DESTAQUE.flatMap(({ slug, tipo }) => {
    const produto = produtoPorSlug(slug, tipo)
    return produto ? [{ tipo, produto }] : []
  })
}
