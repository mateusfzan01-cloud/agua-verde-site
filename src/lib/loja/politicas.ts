/**
 * Prazos de cancelamento e arrependimento (decisões 33 e 36).
 *
 * - Transfer: cancelamento grátis até 24 h antes.
 * - Passeio: até 48 h antes; na alta temporada, 24 h.
 * - Arrependimento: 48 h depois da compra, reembolso integral, se o serviço ainda não começou.
 *
 * As datas da alta temporada ainda não foram definidas pelo dono: a lista abaixo
 * começa vazia. Quando houver tabela no banco, `periodos` virá de lá.
 */
import type { TipoProduto } from './tipos'

export const HORAS_CANCELAMENTO_TRANSFER = 24
export const HORAS_CANCELAMENTO_PASSEIO = 48
export const HORAS_CANCELAMENTO_PASSEIO_ALTA_TEMPORADA = 24
export const HORAS_ARREPENDIMENTO = 48

/** Passeio tem horário combinado depois da reserva; para o prazo usamos esta hora de referência. */
export const HORA_REFERENCIA_PASSEIO = '08:00'

/** Pernambuco não tem horário de verão: UTC−3 o ano todo. */
const FUSO = '-03:00'

export interface PeriodoAltaTemporada {
  /** AAAA-MM-DD, inclusive. */
  inicio: string
  /** AAAA-MM-DD, inclusive. */
  fim: string
}

/** A definir pelo dono. Vazia = nenhum período de alta temporada. */
export const ALTA_TEMPORADA: PeriodoAltaTemporada[] = []

/** Momento em que o serviço começa (data e hora marcadas, no horário de Recife). */
export function inicioDoServico(dataIso: string, hora: string): Date {
  return new Date(`${dataIso}T${hora}:00${FUSO}`)
}

export function emAltaTemporada(dataIso: string, periodos: PeriodoAltaTemporada[] = ALTA_TEMPORADA): boolean {
  return periodos.some((p) => dataIso >= p.inicio && dataIso <= p.fim)
}

export function horasDeAntecedencia(
  tipo: TipoProduto,
  dataIso: string,
  periodos: PeriodoAltaTemporada[] = ALTA_TEMPORADA,
): number {
  if (tipo === 'transfer') return HORAS_CANCELAMENTO_TRANSFER
  return emAltaTemporada(dataIso, periodos)
    ? HORAS_CANCELAMENTO_PASSEIO_ALTA_TEMPORADA
    : HORAS_CANCELAMENTO_PASSEIO
}

/** Último instante em que o cliente cancela de graça. */
export function prazoCancelamentoGratis(
  tipo: TipoProduto,
  dataIso: string,
  hora: string,
  periodos: PeriodoAltaTemporada[] = ALTA_TEMPORADA,
): Date {
  const inicio = inicioDoServico(dataIso, hora)
  return new Date(inicio.getTime() - horasDeAntecedencia(tipo, dataIso, periodos) * 3_600_000)
}

export type MotivoDoCancelamento = 'arrependimento' | 'dentro_do_prazo' | 'fora_do_prazo' | 'servico_ja_comecou'

export interface DecisaoDeCancelamento {
  /** true = o botão "cancelar" reembolsa na hora; false = orientar a falar no WhatsApp. */
  reembolsoAutomatico: boolean
  motivo: MotivoDoCancelamento
  /** Até quando o cancelamento grátis vale (para mostrar ao cliente). */
  gratisAte: Date
}

export function avaliarCancelamento(args: {
  tipo: TipoProduto
  dataIso: string
  hora: string
  pagoEm: Date
  agora: Date
  periodos?: PeriodoAltaTemporada[]
}): DecisaoDeCancelamento {
  const { tipo, dataIso, hora, pagoEm, agora, periodos = ALTA_TEMPORADA } = args
  const inicio = inicioDoServico(dataIso, hora)
  const gratisAte = prazoCancelamentoGratis(tipo, dataIso, hora, periodos)

  if (agora >= inicio) return { reembolsoAutomatico: false, motivo: 'servico_ja_comecou', gratisAte }

  const fimDoArrependimento = new Date(pagoEm.getTime() + HORAS_ARREPENDIMENTO * 3_600_000)
  if (agora <= fimDoArrependimento) return { reembolsoAutomatico: true, motivo: 'arrependimento', gratisAte }

  if (agora <= gratisAte) return { reembolsoAutomatico: true, motivo: 'dentro_do_prazo', gratisAte }
  return { reembolsoAutomatico: false, motivo: 'fora_do_prazo', gratisAte }
}
