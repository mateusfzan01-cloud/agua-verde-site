import { describe, expect, it } from 'vitest'
import {
  COTACOES_ILUSTRATIVAS,
  converterDeReais,
  formatarAproximado,
  formatarReais,
  moedaConhecida,
  moedaPadraoDoIdioma,
  MOEDAS_DO_TOPO,
  nomeDaMoeda,
} from './moeda'

describe('moeda', () => {
  it('moeda padrão por idioma: pt reais, es euro, en dólar', () => {
    expect(moedaPadraoDoIdioma('pt')).toBe('BRL')
    expect(moedaPadraoDoIdioma('es')).toBe('EUR')
    expect(moedaPadraoDoIdioma('en')).toBe('USD')
  })
  it('converte reais pela cotação', () => {
    expect(converterDeReais(501, 'USD')).toBeCloseTo(100, 5)
    expect(converterDeReais(585, 'EUR')).toBeCloseTo(100, 5)
    expect(converterDeReais(100, 'BRL')).toBe(100)
  })
  it('recusa moeda sem cotação', () => {
    expect(() => converterDeReais(100, 'XXX')).toThrow()
    expect(moedaConhecida('XXX')).toBe(false)
  })
  it('real não gera valor aproximado', () => {
    expect(formatarAproximado(740, 'BRL', 'pt')).toBeNull()
    expect(formatarAproximado(740, 'XXX', 'pt')).toBeNull()
  })
  it('valor aproximado começa com ≈ e traz o número convertido', () => {
    const t = formatarAproximado(501, 'USD', 'en')!
    expect(t.startsWith('≈')).toBe(true)
    expect(t).toMatch(/100/)
  })
  it('formata reais com e sem centavos', () => {
    expect(formatarReais(740, 'pt')).toMatch(/R\$\s?740/)
    expect(formatarReais(740, 'pt', true)).toMatch(/740,00/)
  })
  it('todas as moedas do topo têm cotação e nome', () => {
    for (const m of MOEDAS_DO_TOPO) {
      expect(COTACOES_ILUSTRATIVAS.reaisPorUnidade[m], m).toBeGreaterThan(0)
      expect(nomeDaMoeda(m, 'pt').length).toBeGreaterThan(2)
    }
  })
})
