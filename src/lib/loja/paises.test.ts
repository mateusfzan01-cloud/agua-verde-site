import { describe, expect, it } from 'vitest'
import { montarTelefone, paisPadraoDoIdioma, PAISES } from './paises'
import { normalizarTelefone } from './contato'

describe('paises', () => {
  it('não há país repetido e todo código de discagem tem só dígitos', () => {
    expect(new Set(PAISES.map((p) => p.iso)).size).toBe(PAISES.length)
    for (const p of PAISES) expect(p.dial).toMatch(/^\d{1,3}$/)
  })
  it('país padrão por idioma: pt Brasil, es Argentina, en Estados Unidos', () => {
    expect(paisPadraoDoIdioma('pt')).toBe('BR')
    expect(paisPadraoDoIdioma('es')).toBe('AR')
    expect(paisPadraoDoIdioma('en')).toBe('US')
  })
  it('monta o número internacional a partir do país e do que foi digitado', () => {
    expect(montarTelefone('BR', '(81) 99947-3200')).toBe('+5581999473200')
    expect(montarTelefone('BR', '081 99947-3200')).toBe('+5581999473200')
    expect(montarTelefone('AR', '9 11 1234-5678')).toBe('+5491112345678')
    expect(montarTelefone('US', '(305) 555-0142')).toBe('+13055550142')
    expect(montarTelefone('BR', '')).toBe('')
  })
  it('número colado com + ignora o país escolhido', () => {
    expect(montarTelefone('BR', '+54 9 11 1234-5678')).toBe('+5491112345678')
  })
  it('o número montado passa na validação do servidor', () => {
    for (const [iso, n] of [['BR', '81 99947-3200'], ['AR', '9 11 1234-5678'], ['US', '305 555 0142'], ['PT', '912 345 678']] as const) {
      expect(normalizarTelefone(montarTelefone(iso, n)), `${iso} ${n}`).not.toBeNull()
    }
  })
})
