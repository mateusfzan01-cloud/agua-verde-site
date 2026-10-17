import { describe, expect, it } from 'vitest'
import { lerQuery, montarQuery } from './checkout-url'
import { dataMinimaDeReserva, validarAgenda, hojeEmRecife } from './datas'

describe('checkout-url', () => {
  it('ida e volta da escolha pela URL', () => {
    const q = montarQuery({ slug: 'x', selecao: { veiculos: { sedan_economico: 2, mini_van: 0, spin: 1 } }, data: '2026-12-15', hora: '14:30', dataVolta: '2026-12-22', horaVolta: '10:00' })
    expect(q).toBe('s=x&v=sedan_economico.2%2Cspin.1&d=2026-12-15&h=14%3A30&d2=2026-12-22&h2=10%3A00')
    expect(lerQuery(new URLSearchParams(q))).toEqual({
      slug: 'x', selecao: { veiculos: { sedan_economico: 2, spin: 1 } }, data: '2026-12-15', hora: '14:30', dataVolta: '2026-12-22', horaVolta: '10:00',
    })
  })
  it('por pessoa', () => {
    const e = lerQuery(new URLSearchParams('s=y&p=3&d=2026-12-15'))!
    expect(e.selecao).toEqual({ veiculos: {}, pessoas: 3 })
  })
  it('ignora lixo na URL', () => {
    const e = lerQuery(new URLSearchParams('s=y&v=a.x,b.-1,c.2.5,,d.3&p=abc'))!
    expect(e.selecao.veiculos).toEqual({ d: 3 })
    expect(e.selecao.pessoas).toBeUndefined()
    expect(lerQuery(new URLSearchParams(''))).toBeNull()
  })
})

describe('datas', () => {
  it('hoje em Recife respeita UTC−3 (à noite em UTC ainda é "ontem" no Brasil)', () => {
    expect(hojeEmRecife(new Date('2026-12-02T01:00:00Z'))).toBe('2026-12-01')
    expect(dataMinimaDeReserva(new Date('2026-12-02T01:00:00Z'))).toBe('2026-12-02')
    expect(dataMinimaDeReserva(new Date('2026-12-31T20:00:00Z'))).toBe('2027-01-01')
  })
  it('valida ida, volta e horários', () => {
    const agora = new Date('2026-12-01T12:00:00Z')
    expect(validarAgenda({ tipo: 'transfer', sentido: 'ida', data: '2026-12-02', hora: '09:00' }, agora)).toEqual([])
    expect(validarAgenda({ tipo: 'passeio', sentido: 'n/a', data: '2026-12-02' }, agora)).toEqual([])
    expect(validarAgenda({ tipo: 'transfer', sentido: 'ida', data: '2026-02-30', hora: '25:00' }, agora)).toEqual(['data_invalida', 'hora_invalida'])
    expect(validarAgenda({ tipo: 'transfer', sentido: 'ida_volta', data: '2026-12-10', hora: '09:00', dataVolta: '2026-12-09', horaVolta: '09:00' }, agora)).toEqual(['volta_antes_da_ida'])
  })
})
