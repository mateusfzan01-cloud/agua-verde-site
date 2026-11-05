import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { produtoPorSlug, produtosPorTipo } from '@/lib/loja/catalogo'
import { caminhoLocalizado } from '@/lib/loja/formatos'
import { PaginaDeProduto } from '@/components/loja/PaginaDeProduto'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => produtosPorTipo('transfer').map((p) => ({ locale, slug: p.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const produto = produtoPorSlug(slug, 'transfer')
  if (!produto || !hasLocale(routing.locales, locale)) return {}
  return {
    title: produto.seo.titulo[locale],
    description: produto.seo.descricao[locale],
    alternates: {
      canonical: caminhoLocalizado(locale, '/transfers/' + slug),
      languages: { pt: '/transfers/' + slug, es: '/es/transfers/' + slug, en: '/en/transfers/' + slug },
    },
    openGraph: { title: produto.seo.titulo[locale], description: produto.seo.descricao[locale], images: produto.imagens.slice(0, 1) },
  }
}

export default async function Pagina({ params }: Props) {
  const { locale, slug } = await params
  const produto = produtoPorSlug(slug, 'transfer')
  if (!produto || !hasLocale(routing.locales, locale)) notFound()
  return <PaginaDeProduto locale={locale} produto={produto} />
}
