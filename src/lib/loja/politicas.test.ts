import { describe, expect, it } from 'vitest'
import {
  avaliarCancelamento,
  emAltaTemporada,
  horasDeAntecedencia,
  inicioDoServico,
  prazoCancelamentoGratis,
  type PeriodoAltaTemporada,
} from './politicas'

const alta: PeriodoAltaTemporada[] = [{ inicio: '2026-12-20', fim: '2027-01-05' }]

describe('prazos', () => {
  it('transfer: 24 h; passeio: 48 h; passeio em alta temporada: 24 h', () => {
    expect(horasDeAntecedencia('transfer', '2026-12-25', alta)).toBe(24)
    expect(horasDeAntecedencia('passeio', '2026-12-10', alta)).toBe(48)
    expect(horasDeAntecedencia('passeio', '2026-12-25', alta)).toBe(24)
  })
  it('alta temporada inclui o primeiro e o último dia', () => {
    expect(emAltaTemporada('2026-12-20', alta)).toBe(true)
    expect(emAltaTemporada('2027-01-05', alta)).toBe(true)
    expect(emAltaTemporada('2027-01-06', alta)).toBe(false)
    expect(emAltaTemporada('2026-12-19', alta)).toBe(false)
  })
  it('sem períodos cadastrados, nenhuma data é alta temporada', () => {
    expect(emAltaTemporada('2026-12-25', [])).toBe(false)
  })
  it('horário de Recife é UTC−3', () => {
    expect(inicioDoServico('2026-12-15', '14:30').toISOString()).toBe('2026-12-15T17:30:00.000Z')
  })
  it('prazo grátis do transfer: 24 h antes', () => {
    expect(prazoCancelamentoGratis('transfer', '2026-12-15', '14:30', []).toISOString()).toBe('2026-12-14T17:30:00.000Z')
  })
  it('prazo grátis do passeio: 48 h antes da hora de referência', () => {
    expect(prazoCancelamentoGratis('passeio', '2026-12-17', '08:00', []).toISOString()).toBe('2026-12-15T11:00:00.000Z')
  })
})

describe('avaliarCancelamento', () => {
  const base = { tipo: 'transfer' as const, dataIso: '2026-12-15', hora: '14:30', periodos: [] }
  const pagoEm = new Date('2026-12-01T12:00:00Z')

  it('até 48 h depois da compra: arrependimento, reembolso na hora', () => {
    const d = avaliarCancelamento({ ...base, pagoEm, agora: new Date('2026-12-03T11:59:00Z') })
    expect(d).toMatchObject({ reembolsoAutomatico: true, motivo: 'arrependimento' })
  })
  it('depois do arrependimento e antes do prazo: reembolso dentro do prazo', () => {
    const d = avaliarCancelamento({ ...base, pagoEm, agora: new Date('2026-12-10T12:00:00Z') })
    expect(d).toMatchObject({ reembolsoAutomatico: true, motivo: 'dentro_do_prazo' })
  })
  it('depois do prazo: orientar o WhatsApp', () => {
    const d = avaliarCancelamento({ ...base, pagoEm, agora: new Date('2026-12-14T18:00:00Z') })
    expect(d).toMatchObject({ reembolsoAutomatico: false, motivo: 'fora_do_prazo' })
  })
  it('compra em cima da hora: arrependimento não vale se o serviço já começou', () => {
    const d = avaliarCancelamento({
      ...base,
      pagoEm: new Date('2026-12-15T10:00:00Z'),
      agora: new Date('2026-12-15T18:00:00Z'),
    })
    expect(d).toMatchObject({ reembolsoAutomatico: false, motivo: 'servico_ja_comecou' })
  })
  it('compra de última hora (menos de 24 h antes) ainda tem as 48 h de arrependimento enquanto o serviço não começou', () => {
    const d = avaliarCancelamento({
      ...base,
      pagoEm: new Date('2026-12-15T10:00:00Z'),
      agora: new Date('2026-12-15T12:00:00Z'),
    })
    expect(d).toMatchObject({ reembolsoAutomatico: true, motivo: 'arrependimento' })
  })
})
