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
    title: t('transfersTitulo') + ' | Água Verde',
    description: t('transfersSub'),
    alternates: {
      canonical: caminhoLocalizado(hasLocale(routing.locales, locale) ? locale : 'pt', '/transfers'),
      languages: { pt: '/transfers', es: '/es/transfers', en: '/en/transfers' },
    },
  }
}

export default async function Pagina({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  return <PaginaDeCatalogo locale={locale} tipo="transfer" />
}
