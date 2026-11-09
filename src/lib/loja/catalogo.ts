/**
 * Catálogo da loja, lido dos JSON de docs/loja/conteudo/ (gerados na revisão do
 * catálogo da Paytour). Quando a tabela `produtos` existir no banco (etapa C),
 * só este arquivo muda; o resto do código continua igual.
 *
 * Importar apenas em componentes de servidor: o JSON é grande.
 */
import produtosJson from '../../../docs/loja/conteudo/produtos.json'
import veiculosJson from '../../../docs/loja/conteudo/veiculos-paytour.json'
import type { Idioma, ModeloPreco, Produto, Sentido, TipoDeVeiculo, TipoProduto } from './tipos'

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizaProduto(p: any): Produto {
  return {
    ordem: p.ordem,
    slug: p.slug,
    slugPaytour: p.slug_paytour,
    tipo: p.tipo as TipoProduto,
    nome: p.nome,
    descricao: p.descricao,
    inclusos: p.inclusos,
    naoInclusos: p.nao_inclusos,
    origemPadrao: p.origem_padrao,
    destinoPadrao: p.destino_padrao,
    sentido: p.sentido as Sentido,
    modeloPreco: p.modelo_preco as ModeloPreco,
    precoPorPessoa: p.preco_por_pessoa ?? null,
    veiculos: (p.veiculos ?? []).map((v: any) => ({ tipo: v.tipo, preco: v.preco })),
    maxPorCompra: p.max_por_compra ?? 10,
    duracaoMin: p.duracao_min ?? null,
    imagens: p.imagens ?? [],
    ativo: p.ativo !== false,
    seo: { titulo: p.seo.titulo, descricao: p.seo.descricao },
  }
}

const TODOS: Produto[] = (produtosJson as any[])
  .map(normalizaProduto)
  .sort((a, b) => a.ordem - b.ordem)

const TIPOS_DE_VEICULO: Record<string, TipoDeVeiculo> = Object.fromEntries(
  Object.entries((veiculosJson as any).tipos).map(([chave, v]: [string, any]) => [
    chave,
    {
      chave,
      nome: { pt: v.pt, es: v.es, en: v.en },
      capacidade: v.capacidade,
      paxMax: v.pax_max,
    } satisfies TipoDeVeiculo,
  ]),
)
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Produtos à venda (os marcados como inativos não aparecem na loja). */
export function produtosAtivos(): Produto[] {
  return TODOS.filter((p) => p.ativo)
}

export function produtosPorTipo(tipo: TipoProduto): Produto[] {
  return produtosAtivos().filter((p) => p.tipo === tipo)
}

export function produtoPorSlug(slug: string, tipo?: TipoProduto): Produto | undefined {
  const p = TODOS.find((x) => x.slug === slug && x.ativo)
  return p && (!tipo || p.tipo === tipo) ? p : undefined
}

/** Todos os produtos, inclusive inativos (usado só nos redirects da Paytour). */
export function todosOsProdutos(): Produto[] {
  return TODOS
}

export function tipoDeVeiculo(chave: string): TipoDeVeiculo | undefined {
  return TIPOS_DE_VEICULO[chave]
}

/** Veículos de um produto já com nome e capacidade no idioma pedido. */
export function veiculosDoProduto(produto: Produto, idioma: Idioma) {
  return produto.veiculos.map((v) => {
    const t = TIPOS_DE_VEICULO[v.tipo]
    return {
      tipo: v.tipo,
      preco: v.preco,
      nome: t ? t.nome[idioma] : v.tipo,
      capacidade: t ? t.capacidade[idioma] : '',
    }
  })
}
