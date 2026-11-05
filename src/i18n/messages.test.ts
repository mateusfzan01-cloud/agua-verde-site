import { describe, expect, it } from 'vitest'
import pt from './messages/pt.json'
import es from './messages/es.json'
import en from './messages/en.json'

function chaves(obj: unknown, prefixo = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefixo]
  return Object.entries(obj).flatMap(([k, v]) => chaves(v, prefixo ? `${prefixo}.${k}` : k))
}

function valores(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj]
  if (typeof obj !== 'object' || obj === null) return []
  return Object.values(obj).flatMap(valores)
}

describe('mensagens da loja', () => {
  it('português, espanhol e inglês têm exatamente as mesmas chaves', () => {
    const base = chaves(pt).sort()
    expect(chaves(es).sort()).toEqual(base)
    expect(chaves(en).sort()).toEqual(base)
  })
  it('nenhum texto está vazio', () => {
    for (const m of [pt, es, en]) for (const v of valores(m)) expect(v.trim().length).toBeGreaterThan(0)
  })
  it('os textos com {n} têm o espaço nos três idiomas', () => {
    for (const m of [pt, es, en]) expect(m.Loja.produto.maximo).toContain('{n}')
  })
})
