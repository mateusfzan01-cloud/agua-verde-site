import { intlLocale, type Locale } from '@/i18n/routing'

/** "ter., 15 de dez." (+ ", 14:30" quando há hora). */
export function formatarDataEHora(dataIso: string, hora: string | null | undefined, idioma: Locale): string {
  const d = new Date(`${dataIso}T12:00:00-03:00`)
  const data = d.toLocaleDateString(intlLocale[idioma], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Recife' })
  return hora ? `${data}, ${hora}` : data
}

/** Momento exato (cancelamento grátis até...) no horário de Recife. */
export function formatarMomento(momento: Date, idioma: Locale): string {
  return momento.toLocaleString(intlLocale[idioma], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Recife',
  })
}

/** Caminho com prefixo de idioma (português fica sem prefixo). */
export function caminhoLocalizado(idioma: Locale, caminho: string): string {
  return idioma === 'pt' ? caminho : `/${idioma}${caminho}`
}
