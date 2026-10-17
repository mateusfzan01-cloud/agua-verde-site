import { describe, expect, it } from 'vitest'
import { cpfValido, normalizarTelefone, validarPassageiro } from './contato'

describe('normalizarTelefone', () => {
  it('aceita celular brasileiro em formatos comuns', () => {
    expect(normalizarTelefone('(81) 99947-3200')).toBe('+5581999473200')
    expect(normalizarTelefone('81999473200')).toBe('+5581999473200')
    expect(normalizarTelefone('+55 81 99947-3200')).toBe('+5581999473200')
    expect(normalizarTelefone('5581999473200')).toBe('+5581999473200')
  })
  it('aceita número internacional com +', () => {
    expect(normalizarTelefone('+54 9 11 1234-5678')).toBe('+5491112345678')
  })
  it('recusa número curto ou sem DDD', () => {
    expect(normalizarTelefone('99947-3200')).toBeNull()
    expect(normalizarTelefone('123')).toBeNull()
    expect(normalizarTelefone('')).toBeNull()
  })
})

describe('cpfValido', () => {
  it('confere os dígitos verificadores', () => {
    expect(cpfValido('529.982.247-25')).toBe(true)
    expect(cpfValido('52998224725')).toBe(true)
    expect(cpfValido('529.982.247-26')).toBe(false)
  })
  it('recusa sequências repetidas e tamanho errado', () => {
    expect(cpfValido('111.111.111-11')).toBe(false)
    expect(cpfValido('123')).toBe(false)
  })
})

describe('validarPassageiro', () => {
  const ok = { nome: 'Lucía Fernández', telefone: '+54 9 11 1234-5678', email: 'lucia@exemplo.com', aceitouTermos: true }
  it('aceita dados completos; CPF é opcional', () => {
    expect(validarPassageiro(ok)).toEqual({ ok: true, telefoneE164: '+5491112345678' })
    expect(validarPassageiro({ ...ok, cpf: '' }).ok).toBe(true)
  })
  it('aponta todos os campos com erro', () => {
    const r = validarPassageiro({ nome: 'Lucía', telefone: '1', email: 'x', cpf: '123', aceitouTermos: false })
    expect(r).toEqual({ ok: false, erros: ['nome', 'telefone', 'email', 'cpf', 'termos'] })
  })
})
