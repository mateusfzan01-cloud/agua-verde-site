import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { caminhoLocalizado } from '@/lib/loja/formatos'
import { PaginaDeCatalogo } from '@/components/loja/PaginaDeCatalogo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Loja.catalogo' })
  return {
    title: t('passeiosTitulo') + ' | Água Verde',
    description: t('passeiosSub'),
    alternates: {
      canonical: caminhoLocalizado(hasLocale(routing.locales, locale) ? locale : 'pt', '/passeios'),
      languages: { pt: '/passeios', es: '/es/passeios', en: '/en/passeios' },
    },
  }
}

export default async function Pagina({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  return <PaginaDeCatalogo locale={locale} tipo="passeio" />
}
