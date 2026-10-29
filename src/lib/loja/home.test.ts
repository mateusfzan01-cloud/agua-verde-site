import { describe, expect, it } from 'vitest'
import { maisReservados, rotasDaBusca, slidesDeDestaque } from './home'

describe('home da loja', () => {
  it('a busca tem uma rota para cada par origem → destino, com ida e/ou ida e volta', () => {
    const rotas = rotasDaBusca()
    expect(rotas.length).toBeGreaterThan(20)
    for (const r of rotas) expect(r.ida || r.idaVolta, `${r.origem} → ${r.destino}`).toBeTruthy()
    const pdg = rotas.find((r) => r.origem === 'Aeroporto Internacional do Recife' && r.destino.startsWith('Porto de Galinhas'))!
    expect(pdg.ida?.preco).toBe(220)
    expect(pdg.idaVolta?.preco).toBe(400)
    const maragogi = rotas.find((r) => r.destino.startsWith('Maragogi') && r.origem === 'Aeroporto Internacional do Recife')!
    expect(maragogi.ida?.preco).toBe(380)
    expect(maragogi.idaVolta?.preco).toBe(740)
  })
  it('não há rota repetida', () => {
    const chaves = rotasDaBusca().map((r) => `${r.origem}|${r.destino}`)
    expect(new Set(chaves).size).toBe(chaves.length)
  })
  it('mais reservados: 5 transfers e 4 passeios, todos existentes, com ranking só nos 3 primeiros transfers', () => {
    expect(maisReservados('transfer')).toHaveLength(5)
    expect(maisReservados('passeio')).toHaveLength(4)
    expect(maisReservados('transfer').filter((i) => i.rank).map((i) => i.rank)).toEqual([1, 2, 3])
  })
  it('destaques: 4 slides com produtos reais', () => {
    expect(slidesDeDestaque()).toHaveLength(4)
  })
})
