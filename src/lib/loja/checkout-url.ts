/**
 * Leva a escolha do cliente da página do produto até o checkout pela URL
 * (sem criar pedido ainda: o pedido nasce quando ele envia os dados).
 * O servidor sempre recalcula o preço pelo catálogo; nada aqui é confiável.
 */
import type { Selecao } from './tipos'

export interface EscolhaNaUrl {
  slug: string
  selecao: Selecao
  data: string
  hora: string
  dataVolta: string
  horaVolta: string
}

export function montarQuery(e: EscolhaNaUrl): string {
  const q = new URLSearchParams()
  q.set('s', e.slug)
  const veiculos = Object.entries(e.selecao.veiculos ?? {}).filter(([, n]) => n > 0)
  if (veiculos.length) q.set('v', veiculos.map(([tipo, n]) => `${tipo}.${n}`).join(','))
  if (e.selecao.pessoas) q.set('p', String(e.selecao.pessoas))
  if (e.data) q.set('d', e.data)
  if (e.hora) q.set('h', e.hora)
  if (e.dataVolta) q.set('d2', e.dataVolta)
  if (e.horaVolta) q.set('h2', e.horaVolta)
  return q.toString()
}

type Parametros = { get(nome: string): string | null }

export function lerQuery(params: Parametros): EscolhaNaUrl | null {
  const slug = params.get('s')
  if (!slug) return null
  const veiculos: Record<string, number> = {}
  for (const par of (params.get('v') ?? '').split(',').filter(Boolean)) {
    const m = /^([a-z0-9_]+)\.(\d{1,3})$/.exec(par)
    if (m && Number(m[2]) > 0) veiculos[m[1]] = Number(m[2])
  }
  const p = params.get('p')
  const pessoas = p !== null && Number.isInteger(Number(p)) ? Number(p) : undefined
  return {
    slug,
    selecao: { veiculos, ...(pessoas !== undefined ? { pessoas } : {}) },
    data: params.get('d') ?? '',
    hora: params.get('h') ?? '',
    dataVolta: params.get('d2') ?? '',
    horaVolta: params.get('h2') ?? '',
  }
}
