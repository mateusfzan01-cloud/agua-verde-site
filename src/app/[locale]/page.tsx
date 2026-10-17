import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/config'
import { routing } from '@/i18n/routing'
import { produtosPorTipo } from '@/lib/loja/catalogo'
import { CartaoDeProduto } from '@/components/loja/CartaoDeProduto'
import { Promessas } from '@/components/loja/Promessas'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: locale === 'pt' ? '/' : `/${locale}`, languages: { pt: '/', es: '/es', en: '/en' } },
  }
}

/** Entrada da loja em espanhol e inglês (o português continua na home atual do site). */
export default async function EntradaDaLoja({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.home' })
  const destaquesTransfer = produtosPorTipo('transfer').slice(0, 6)
  const destaquesPasseio = produtosPorTipo('passeio').slice(0, 6)

  return (
    <div className="grid gap-8">
      <section className="grid gap-3 rounded-3xl bg-[#0d2e1c] p-6 text-white sm:p-10">
        <h1 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl">{t('titulo')}</h1>
        <p className="text-lg font-semibold">{t('motorista')}</p>
        <p className="font-semibold text-[#d4a853]">{t('reserve')}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href="/transfers" className="rounded-full bg-[#d4a853] px-5 py-3 font-semibold text-[#1a1a2e]">{t('verTransfers')}</Link>
          <Link href="/passeios" className="rounded-full border border-white/40 px-5 py-3 font-semibold">{t('verPasseios')}</Link>
        </div>
      </section>
      <Promessas locale={locale} />
      <section className="grid gap-4">
        <h2 className="font-heading text-2xl font-semibold">{t('verTransfers')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destaquesTransfer.map((p) => <CartaoDeProduto key={p.slug} produto={p} locale={locale} />)}
        </div>
      </section>
      <section className="grid gap-4">
        <h2 className="font-heading text-2xl font-semibold">{t('verPasseios')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destaquesPasseio.map((p) => <CartaoDeProduto key={p.slug} produto={p} locale={locale} />)}
        </div>
      </section>
    </div>
  )
}
