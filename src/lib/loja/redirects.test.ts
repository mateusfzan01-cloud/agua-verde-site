import { describe, expect, it } from 'vitest'
import coleta from '../../../docs/loja/conteudo/paytour-coleta-2026-10.json'
import produtos from '../../../docs/loja/conteudo/produtos.json'
import { redirectsDaPaytour } from '../../../config/redirects-paytour.js'
import { produtoPorSlug } from './catalogo'

const regras = redirectsDaPaytour(produtos as never[])

describe('redirects da Paytour', () => {
  it('todo endereço da coleta da Paytour tem redirect 301', () => {
    for (const p of coleta.produtos) {
      const caminho = new URL(p.url).pathname
      const regra = regras.find((r: { source: string }) => r.source === caminho)
      expect(regra, caminho).toBeDefined()
      expect(regra.statusCode).toBe(301)
    }
  })
  it('o destino de cada produto à venda existe no catálogo, na pasta certa', () => {
    for (const r of regras as { destination: string }[]) {
      const m = /^\/(transfers|passeios)(?:\/(.+))?$/.exec(r.destination)
      expect(m, r.destination).not.toBeNull()
      if (m![2]) expect(produtoPorSlug(m![2], m![1] === 'transfers' ? 'transfer' : 'passeio'), r.destination).toBeDefined()
    }
  })
  it('produto fora de catálogo vai para a lista da categoria', () => {
    const inativos = (produtos as { ativo: boolean; slug_paytour: string }[]).filter((p) => !p.ativo)
    expect(inativos).toHaveLength(2)
    for (const p of inativos) {
      const r = regras.find((x: { source: string }) => x.source === `/passeio/${p.slug_paytour}`)
      expect(r.destination).toMatch(/^\/(transfers|passeios)$/)
    }
  })
  it('não há origem repetida', () => {
    const fontes = regras.map((r: { source: string }) => r.source)
    expect(new Set(fontes).size).toBe(fontes.length)
  })
})
