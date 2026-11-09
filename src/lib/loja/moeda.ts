/**
 * Moedas (decisão 24): a cobrança é sempre em reais; nas outras moedas o site
 * mostra só um valor aproximado, com aviso.
 *
 * As cotações abaixo são ILUSTRATIVAS (iguais às do protótipo). No lançamento,
 * uma rotina diária busca a cotação numa fonte oficial e a guarda no banco
 * (`obterCotacoes` passa a ler de lá). Nada é consultado a cada visita.
 */
import type { Idioma } from './tipos'
import { intlLocale } from '@/i18n/routing'

export interface Cotacoes {
  /** Data da cotação (AAAA-MM-DD). */
  data: string
  /** De onde vieram os números. */
  fonte: string
  /** Quantos reais vale 1 unidade da moeda. */
  reaisPorUnidade: Record<string, number>
}

export const COTACOES_ILUSTRATIVAS: Cotacoes = {
  data: '2026-10-08',
  fonte: 'ilustrativa',
  reaisPorUnidade: {
    BRL: 1, USD: 5.01, EUR: 5.85, GBP: 6.7, ARS: 0.0035, CLP: 0.0053, CHF: 6.25, CAD: 3.6,
    AUD: 3.3, UYU: 0.125, COP: 0.0012, MXN: 0.27, PEN: 1.4, JPY: 0.034, CNY: 0.7, KRW: 0.0036,
    INR: 0.057, THB: 0.15, SGD: 3.9, HKD: 0.64, NZD: 2.95, AED: 1.364, ILS: 1.5, TRY: 0.12,
    EGP: 0.1, MAD: 0.54, ZAR: 0.28, SEK: 0.53, NOK: 0.5, DKK: 0.78, CZK: 0.24, HUF: 0.0148,
    PLN: 1.38, RON: 1.17, UAH: 0.12, VND: 0.0002,
  },
}

/** Moedas mostradas no topo da janela de escolha. */
export const MOEDAS_DO_TOPO = ['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'CLP', 'CHF', 'CAD'] as const

/** Sem escolha do cliente: português mostra só reais, espanhol mostra euro, inglês mostra dólar. */
export function moedaPadraoDoIdioma(idioma: Idioma): string {
  return idioma === 'pt' ? 'BRL' : idioma === 'es' ? 'EUR' : 'USD'
}

export function moedaConhecida(codigo: string, cotacoes: Cotacoes = COTACOES_ILUSTRATIVAS): boolean {
  return Object.prototype.hasOwnProperty.call(cotacoes.reaisPorUnidade, codigo)
}

export function converterDeReais(valor: number, moeda: string, cotacoes: Cotacoes = COTACOES_ILUSTRATIVAS): number {
  const taxa = cotacoes.reaisPorUnidade[moeda]
  if (!taxa) throw new Error(`Moeda sem cotação: ${moeda}`)
  return valor / taxa
}

export function formatarReais(valor: number, idioma: Idioma, comCentavos = false): string {
  return new Intl.NumberFormat(intlLocale[idioma], {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: comCentavos ? 2 : 0,
    maximumFractionDigits: comCentavos ? 2 : 0,
  }).format(valor)
}

/** "≈ US$ 148" para o valor em reais; null quando a moeda é o próprio real. */
export function formatarAproximado(
  valorEmReais: number,
  moeda: string,
  idioma: Idioma,
  cotacoes: Cotacoes = COTACOES_ILUSTRATIVAS,
): string | null {
  if (moeda === 'BRL' || !moedaConhecida(moeda, cotacoes)) return null
  const texto = new Intl.NumberFormat(intlLocale[idioma], {
    style: 'currency',
    currency: moeda,
    maximumFractionDigits: 0,
  }).format(converterDeReais(valorEmReais, moeda, cotacoes))
  return `≈ ${texto}`
}

/** Símbolo curto da moeda (R$, US$, €, $...). */
export function simboloDaMoeda(moeda: string, idioma: Idioma): string {
  try {
    const parte = new Intl.NumberFormat(intlLocale[idioma], {
      style: 'currency',
      currency: moeda,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((p) => p.type === 'currency')
    return parte?.value ?? moeda
  } catch {
    return moeda
  }
}

/** Nome da moeda no idioma do visitante ("Dólar americano"). */
export function nomeDaMoeda(moeda: string, idioma: Idioma): string {
  try {
    const nome = new Intl.DisplayNames([intlLocale[idioma]], { type: 'currency' }).of(moeda) ?? moeda
    return nome.charAt(0).toUpperCase() + nome.slice(1)
  } catch {
    return moeda
  }
}
