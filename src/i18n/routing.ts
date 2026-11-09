import { defineRouting } from 'next-intl/routing'

/**
 * Idiomas da loja. Português é o padrão e fica sem prefixo (/transfers);
 * espanhol e inglês usam /es e /en.
 */
export const routing = defineRouting({
  locales: ['pt', 'es', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]

/** Valor do atributo lang do <html> em cada idioma. */
export const htmlLang: Record<Locale, string> = {
  pt: 'pt-BR',
  es: 'es',
  en: 'en',
}

/** Código usado pelo navegador para formatar datas e números. */
export const intlLocale: Record<Locale, string> = {
  pt: 'pt-BR',
  es: 'es-AR',
  en: 'en-GB',
}
