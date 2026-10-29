import { describe, expect, it } from 'vitest'
import { linksDeAcompanhamento } from './acompanhar'
import type { ItemDoPedido } from './pedidos-tipos'

const perna = (ordem: number, viagemToken?: string): ItemDoPedido => ({
  ordem,
  origem: 'Aeroporto do Recife (REC)',
  destino: 'Porto de Galinhas',
  dataIso: '2026-12-15',
  hora: '14:30',
  viagemToken,
})

describe('linksDeAcompanhamento', () => {
  it('monta o link real a partir do token da viagem', () => {
    expect(linksDeAcompanhamento([perna(1, 'abc123')], 'https://app.exemplo.com/acompanhar')).toEqual([
      { ordem: 1, url: 'https://app.exemplo.com/acompanhar/abc123' },
    ])
  })

  it('ida e volta têm um link cada, na ordem', () => {
    const links = linksDeAcompanhamento([perna(1, 'ida'), perna(2, 'volta')], 'https://app.exemplo.com/acompanhar/')
    expect(links.map((l) => l.url)).toEqual(['https://app.exemplo.com/acompanhar/ida', 'https://app.exemplo.com/acompanhar/volta'])
  })

  it('sem viagem de verdade (modo simulado) não inventa link', () => {
    expect(linksDeAcompanhamento([perna(1), perna(2)])).toEqual([])
  })

  it('perna sem token fica de fora, a outra continua', () => {
    expect(linksDeAcompanhamento([perna(1, 'ida'), perna(2)], 'https://x.test/a').map((l) => l.ordem)).toEqual([1])
  })

  it('protege o token na URL', () => {
    expect(linksDeAcompanhamento([perna(1, 'a/b?c')], 'https://x.test/a')[0].url).toBe('https://x.test/a/a%2Fb%3Fc')
  })
})
