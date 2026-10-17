import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@/i18n/config'
import type { Locale } from '@/i18n/routing'
import { veiculosDoProduto } from '@/lib/loja/catalogo'
import { precoAPartirDe } from '@/lib/loja/precos'
import type { Produto } from '@/lib/loja/tipos'
import { Galeria } from './Galeria'
import { Promessas } from './Promessas'
import { ReservaWidget } from './ReservaWidget'
import { TextoRico } from './TextoRico'

export async function PaginaDeProduto({ locale, produto }: { locale: Locale; produto: Produto }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.produto' })
  const ehTransfer = produto.tipo === 'transfer'
  const veiculos = veiculosDoProduto(produto, locale)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: produto.nome[locale],
    description: produto.seo.descricao[locale],
    provider: { '@type': 'TravelAgency', name: 'Água Verde Viagens e Receptivos', url: 'https://aguaverde.tur.br' },
    areaServed: 'Pernambuco, Brasil',
    image: produto.imagens.slice(0, 3),
    offers: { '@type': 'Offer', priceCurrency: 'BRL', price: precoAPartirDe(produto), availability: 'https://schema.org/InStock' },
  }

  return (
    <article className="grid gap-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Link href={ehTransfer ? '/transfers' : '/passeios'} className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a5c38]">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {ehTransfer ? t('voltarTransfers') : t('voltarPasseios')}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-x-8">
        <div className="grid content-start gap-6 lg:col-start-1 lg:row-start-1">
          <Galeria imagens={produto.imagens} alt={produto.nome[locale]} />
          <header className="grid gap-1">
            <h1 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">{produto.nome[locale]}</h1>
            <p className="text-sm text-[#5a6570]">
              {produto.origemPadrao} → {produto.destinoPadrao}
            </p>
          </header>
        </div>

        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-24">
          <ReservaWidget slug={produto.slug} tipo={produto.tipo} sentido={produto.sentido} modeloPreco={produto.modeloPreco} precoPorPessoa={produto.precoPorPessoa} maxPorCompra={produto.maxPorCompra} veiculos={veiculos} />
        </aside>

        <div className="grid content-start gap-6 lg:col-start-1 lg:row-start-2">
          <Promessas locale={locale} />
          <TextoRico texto={produto.descricao[locale]} className="text-[15px] leading-relaxed" />

          {produto.inclusos[locale].length > 0 && (
            <section className="grid gap-2">
              <h2 className="font-heading text-lg font-semibold">{t('inclui')}</h2>
              <ul className="grid gap-1 text-[15px] [&>li]:flex [&>li]:gap-2 [&>li]:before:font-extrabold [&>li]:before:text-[#27ae60] [&>li]:before:content-['✓']">
                {produto.inclusos[locale].map((i) => <li key={i}>{i}</li>)}
              </ul>
            </section>
          )}
          {produto.naoInclusos[locale].length > 0 && (
            <section className="grid gap-2">
              <h2 className="font-heading text-lg font-semibold">{t('naoInclui')}</h2>
              <ul className="grid gap-1 text-[15px] [&>li]:flex [&>li]:gap-2 [&>li]:before:font-extrabold [&>li]:before:text-[#b42318] [&>li]:before:content-['✕']">
                {produto.naoInclusos[locale].map((i) => <li key={i}>{i}</li>)}
              </ul>
            </section>
          )}

          <section className="grid gap-2">
            <h2 className="font-heading text-lg font-semibold">{t('faq')}</h2>
            {[
              [t('f1p'), produto.modeloPreco === 'por_pessoa' ? t('f1rPessoa') : t('f1rVeic')],
              [t('f2p'), ehTransfer ? t('f2rTransfer') : t('f2rPasseio')],
              [t('f3p'), t('f3r')],
            ].map(([p, r]) => (
              <details key={p} className="rounded-xl border border-[#dde5df] bg-white px-4 py-3 [&_summary]:cursor-pointer [&_summary]:font-semibold">
                <summary>{p}</summary>
                <p className="mt-2 text-[15px] text-[#5a6570]">{r}</p>
              </details>
            ))}
          </section>
        </div>
      </div>
    </article>
  )
}
