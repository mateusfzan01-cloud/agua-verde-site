import { describe, expect, it } from 'vitest'
import { calcularPreco, precoAPartirDe, type ProdutoParaPreco } from './precos'
import { produtoPorSlug, produtosAtivos } from './catalogo'

const porVeiculo: ProdutoParaPreco = {
  modeloPreco: 'por_veiculo',
  precoPorPessoa: null,
  maxPorCompra: 10,
  veiculos: [
    { tipo: 'sedan_economico', preco: 740 },
    { tipo: 'mini_van', preco: 1600 },
    { tipo: 'micro_onibus', preco: 3800 },
  ],
}
const porPessoa: ProdutoParaPreco = { modeloPreco: 'por_pessoa', precoPorPessoa: 550, maxPorCompra: 10, veiculos: [] }

describe('calcularPreco, por veículo', () => {
  it('soma quantidade × preço de cada veículo', () => {
    const r = calcularPreco(porVeiculo, { veiculos: { sedan_economico: 2, mini_van: 1 } })
    expect(r).toMatchObject({ ok: true, total: 3080, quantidadeTotal: 3 })
    expect(r.ok && r.linhas).toEqual([
      { tipo: 'sedan_economico', quantidade: 2, precoUnitario: 740, subtotal: 1480 },
      { tipo: 'mini_van', quantidade: 1, precoUnitario: 1600, subtotal: 1600 },
    ])
  })

  it('ignora veículos com quantidade zero', () => {
    const r = calcularPreco(porVeiculo, { veiculos: { sedan_economico: 1, mini_van: 0 } })
    expect(r).toMatchObject({ ok: true, total: 740 })
  })

  it('não aceita compra sem veículo', () => {
    expect(calcularPreco(porVeiculo, {})).toEqual({ ok: false, erro: 'nada_selecionado' })
    expect(calcularPreco(porVeiculo, { veiculos: { mini_van: 0 } })).toEqual({ ok: false, erro: 'nada_selecionado' })
  })

  it('aceita exatamente 10 veículos e recusa 11 (decisão 32)', () => {
    expect(calcularPreco(porVeiculo, { veiculos: { sedan_economico: 6, mini_van: 4 } }).ok).toBe(true)
    expect(calcularPreco(porVeiculo, { veiculos: { sedan_economico: 6, mini_van: 5 } })).toEqual({ ok: false, erro: 'acima_do_limite' })
  })

  it('recusa veículo que o produto não oferece', () => {
    expect(calcularPreco(porVeiculo, { veiculos: { bmw_x1: 1 } })).toEqual({ ok: false, erro: 'veiculo_invalido' })
  })

  it('recusa quantidade negativa, quebrada ou que não é número', () => {
    expect(calcularPreco(porVeiculo, { veiculos: { sedan_economico: -1 } })).toEqual({ ok: false, erro: 'quantidade_invalida' })
    expect(calcularPreco(porVeiculo, { veiculos: { sedan_economico: 1.5 } })).toEqual({ ok: false, erro: 'quantidade_invalida' })
    expect(calcularPreco(porVeiculo, { veiculos: { sedan_economico: NaN } })).toEqual({ ok: false, erro: 'quantidade_invalida' })
  })

  it('ida e volta tem um preço só, sem multiplicar por duas pernas', () => {
    const p = produtoPorSlug('aeroporto-recife-maragogi-ida-e-volta')!
    const r = calcularPreco(p, { veiculos: { sedan_economico: 1 } })
    expect(r).toMatchObject({ ok: true, total: 740 })
  })
})

describe('calcularPreco, por pessoa', () => {
  it('multiplica pessoas pelo preço por pessoa', () => {
    expect(calcularPreco(porPessoa, { pessoas: 3 })).toMatchObject({ ok: true, total: 1650, quantidadeTotal: 3 })
  })
  it('respeita zero, limite e valores inválidos', () => {
    expect(calcularPreco(porPessoa, { pessoas: 0 })).toEqual({ ok: false, erro: 'nada_selecionado' })
    expect(calcularPreco(porPessoa, {})).toEqual({ ok: false, erro: 'nada_selecionado' })
    expect(calcularPreco(porPessoa, { pessoas: 11 })).toEqual({ ok: false, erro: 'acima_do_limite' })
    expect(calcularPreco(porPessoa, { pessoas: 2.5 })).toEqual({ ok: false, erro: 'quantidade_invalida' })
  })
})

describe('precoAPartirDe', () => {
  it('usa o menor preço dos veículos ou o preço por pessoa', () => {
    expect(precoAPartirDe(porVeiculo)).toBe(740)
    expect(precoAPartirDe(porPessoa)).toBe(550)
  })
})

describe('catálogo real', () => {
  it('tem 44 produtos à venda (46 menos 2 inativos)', () => {
    expect(produtosAtivos()).toHaveLength(44)
  })
  it('todo produto à venda tem preço calculável e limite 10', () => {
    for (const p of produtosAtivos()) {
      expect(p.maxPorCompra).toBe(10)
      const sel = p.modeloPreco === 'por_pessoa' ? { pessoas: 1 } : { veiculos: { [p.veiculos[0].tipo]: 1 } }
      const r = calcularPreco(p, sel)
      expect(r.ok, p.slug).toBe(true)
      expect(precoAPartirDe(p), p.slug).toBeGreaterThan(0)
    }
  })
  it('4 produtos são por pessoa e o resto é por veículo', () => {
    const porPessoaN = produtosAtivos().filter((p) => p.modeloPreco === 'por_pessoa').length
    expect(porPessoaN).toBe(4)
  })
  it('slugs são únicos', () => {
    const slugs = produtosAtivos().map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
