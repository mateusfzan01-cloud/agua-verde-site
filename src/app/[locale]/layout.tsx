import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import '../globals.css'
import { inter, outfit } from '../fontes'
import { htmlLang, routing } from '@/i18n/routing'
import { MoedaProvider } from '@/components/loja/MoedaProvider'
import { LojaHeader } from '@/components/loja/LojaHeader'
import { LojaFooter } from '@/components/loja/LojaFooter'
import { FaixaDeAviso } from '@/components/loja/home/FaixaDeAviso'

export const metadata: Metadata = {
  metadataBase: new URL('https://aguaverde.tur.br'),
  title: { default: 'Água Verde Transfers', template: '%s' },
  openGraph: { type: 'website', siteName: 'Água Verde Viagens e Receptivos' },
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LojaLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={htmlLang[locale]} className={`${inter.variable} ${outfit.variable}`}>
      <body className="overflow-x-clip bg-[#fafbfa] font-sans text-[#1a1a2e] antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MoedaProvider>
            <LojaHeader />
            <FaixaDeAviso />
            <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-6">{children}</main>
            <LojaFooter />
          </MoedaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
