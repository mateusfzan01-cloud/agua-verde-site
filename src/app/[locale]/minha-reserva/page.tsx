import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { MinhaReservaForm } from '@/components/loja/MinhaReservaForm'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function MinhaReserva({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.minhaReserva' })
  return (
    <div className="mx-auto grid max-w-md gap-4">
      <h1 className="font-heading text-2xl font-semibold">{t('titulo')}</h1>
      <p className="text-[#5a6570]">{t('ajuda')}</p>
      <MinhaReservaForm />
    </div>
  )
}
