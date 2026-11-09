/**
 * Preço de uma compra (plano §4.3, decisão de copiar a Paytour).
 *
 * - Produto por veículo: total = Σ quantidade × preço do veículo naquele produto.
 *   O cliente não informa passageiros nem malas, só escolhe os veículos.
 * - Produto por pessoa (mergulho, catamarã de Noronha, Trilha dos Escravos):
 *   total = pessoas × preço por pessoa.
 * - Limite por compra (decisão 32): 10 veículos, ou 10 pessoas.
 */
import type { Produto, Selecao } from './tipos'

export type ProdutoParaPreco = Pick<
  Produto,
  'modeloPreco' | 'veiculos' | 'precoPorPessoa' | 'maxPorCompra'
>

export interface LinhaDePreco {
  /** Chave do veículo, ou "pessoa" nos produtos por pessoa. */
  tipo: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export type ErroDePreco =
  | 'nada_selecionado'
  | 'acima_do_limite'
  | 'veiculo_invalido'
  | 'quantidade_invalida'

export type ResultadoDePreco =
  | { ok: true; total: number; quantidadeTotal: number; linhas: LinhaDePreco[] }
  | { ok: false; erro: ErroDePreco }

function centavos(v: number): number {
  return Math.round(v * 100) / 100
}

function inteiroNaoNegativo(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 0
}

export function calcularPreco(produto: ProdutoParaPreco, selecao: Selecao): ResultadoDePreco {
  const linhas: LinhaDePreco[] = []

  if (produto.modeloPreco === 'por_pessoa') {
    const pessoas = selecao.pessoas ?? 0
    if (!inteiroNaoNegativo(pessoas)) return { ok: false, erro: 'quantidade_invalida' }
    if (pessoas === 0) return { ok: false, erro: 'nada_selecionado' }
    if (pessoas > produto.maxPorCompra) return { ok: false, erro: 'acima_do_limite' }
    const unitario = produto.precoPorPessoa ?? 0
    linhas.push({ tipo: 'pessoa', quantidade: pessoas, precoUnitario: unitario, subtotal: centavos(pessoas * unitario) })
  } else {
    for (const [tipo, quantidade] of Object.entries(selecao.veiculos ?? {})) {
      if (!inteiroNaoNegativo(quantidade)) return { ok: false, erro: 'quantidade_invalida' }
      if (quantidade === 0) continue
      const veiculo = produto.veiculos.find((v) => v.tipo === tipo)
      if (!veiculo) return { ok: false, erro: 'veiculo_invalido' }
      linhas.push({ tipo, quantidade, precoUnitario: veiculo.preco, subtotal: centavos(quantidade * veiculo.preco) })
    }
    if (linhas.length === 0) return { ok: false, erro: 'nada_selecionado' }
    if (linhas.reduce((s, l) => s + l.quantidade, 0) > produto.maxPorCompra) {
      return { ok: false, erro: 'acima_do_limite' }
    }
  }

  return {
    ok: true,
    total: centavos(linhas.reduce((s, l) => s + l.subtotal, 0)),
    quantidadeTotal: linhas.reduce((s, l) => s + l.quantidade, 0),
    linhas,
  }
}

/** Menor preço do produto, para o "a partir de" das listas. */
export function precoAPartirDe(produto: ProdutoParaPreco): number {
  if (produto.modeloPreco === 'por_pessoa') return produto.precoPorPessoa ?? 0
  return produto.veiculos.length ? Math.min(...produto.veiculos.map((v) => v.preco)) : 0
}
