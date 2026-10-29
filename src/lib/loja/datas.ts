/** Datas e horários da reserva (sem dependências de servidor: também roda no navegador). */
import type { Sentido, TipoProduto } from './tipos'

const DATA = /^\d{4}-\d{2}-\d{2}$/
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

export type ErroDeAgenda = 'data_invalida' | 'data_no_passado' | 'hora_invalida' | 'volta_antes_da_ida'

/** Data de hoje em Recife (UTC−3), AAAA-MM-DD. */
export function hojeEmRecife(agora: Date): string {
  return new Date(agora.getTime() - 3 * 3_600_000).toISOString().slice(0, 10)
}

/** Primeiro dia em que dá para reservar: amanhã (como no protótipo). */
export function dataMinimaDeReserva(agora: Date): string {
  const d = new Date(`${hojeEmRecife(agora)}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function dataExiste(iso: string | undefined): iso is string {
  if (!iso || !DATA.test(iso)) return false
  const d = new Date(`${iso}T12:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso
}

export function horaValida(hora: string | undefined): hora is string {
  return !!hora && HORA.test(hora)
}

export function validarAgenda(
  a: { tipo: TipoProduto; sentido: Sentido; data?: string; hora?: string; dataVolta?: string; horaVolta?: string },
  agora: Date,
): ErroDeAgenda[] {
  const erros: ErroDeAgenda[] = []
  const minima = dataMinimaDeReserva(agora)
  const ehTransfer = a.tipo === 'transfer'
  const ehIdaEVolta = ehTransfer && a.sentido === 'ida_volta'

  if (!dataExiste(a.data)) erros.push('data_invalida')
  else if (a.data < minima) erros.push('data_no_passado')

  if (ehTransfer && !horaValida(a.hora)) erros.push('hora_invalida')

  if (ehIdaEVolta) {
    if (!dataExiste(a.dataVolta)) erros.push('data_invalida')
    else if (a.dataVolta < minima) erros.push('data_no_passado')
    else if (dataExiste(a.data) && a.dataVolta < a.data) erros.push('volta_antes_da_ida')
    if (!horaValida(a.horaVolta)) erros.push('hora_invalida')
  }
  return [...new Set(erros)]
}
