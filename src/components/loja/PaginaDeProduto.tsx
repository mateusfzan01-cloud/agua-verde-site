import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@/i18n/config'
import type { Locale } from '@/i18n/routing'
import { tipoDeVeiculo, veiculosDoProduto } from '@/lib/loja/catalogo'
import { TRIPADVISOR } from '@/lib/loja/home'
import { precoAPartirDe } from '@/lib/loja/precos'
import type { Produto } from '@/lib/loja/tipos'
import { Tripadvisor } from './home/Tripadvisor'
import { Galeria } from './Galeria'
import { Promessas } from './Promessas'
import { ReservaWidget } from './ReservaWidget'
import { TextoRico } from './TextoRico'

export async function PaginaDeProduto({ locale, produto }: { locale: Locale; produto: Produto }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.produto' })
  const ehTransfer = produto.tipo === 'transfer'
  const veiculos = veiculosDoProduto(produto, locale)
  const ehAeroporto = ehTransfer && produto.origemPadrao.toLowerCase().includes('aeroporto')
  const maiorCapacidade = Math.max(0, ...produto.veiculos.map((v) => tipoDeVeiculo(v.tipo)?.paxMax ?? 0))
  const duracao = produto.duracaoMin ? `${Math.floor(produto.duracaoMin / 60)}h${produto.duracaoMin % 60 ? String(produto.duracaoMin % 60).padStart(2, '0') : ''}` : null
  const fatos: [string, string][] = [
    ...(produto.veiculos.length > 0 ? ([[String(produto.veiculos.length), t('fatoVeiculos')], [String(maiorCapacidade), t('fatoPessoas')]] as [string, string][]) : []),
    ...(ehAeroporto ? ([['60 min', t('fatoEspera')]] as [string, string][]) : []),
    ...(!ehTransfer && duracao ? ([[duracao, t('fatoDuracao')]] as [string, string][]) : []),
  ]

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
          <div className="relative">
            <Galeria imagens={produto.imagens} alt={produto.nome[locale]} />
            {ehTransfer && produto.sentido === 'ida_volta' && (
              <span className="absolute left-3 top-3 rounded-full bg-[#f8efd9] px-2.5 py-1 text-xs font-bold text-[#1a1a2e] sm:left-3">{t('tagIdaVolta')}</span>
            )}
          </div>
          <header className="grid gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#5a6570]">{ehTransfer ? t('catTransfer') : t('catPasseio')}</span>
            <h1 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">{produto.nome[locale]}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f2ea] px-2.5 py-0.5 text-xs font-semibold text-[#1a5c38]">★ {TRIPADVISOR.nota} · Tripadvisor</span>
              <span className="inline-flex items-center rounded-full bg-[#e6f2ea] px-2.5 py-0.5 text-xs font-semibold text-[#1a5c38]">{ehTransfer ? t('conf') : t('confPasseio')}</span>
            </div>
            {fatos.length > 0 && (
              <dl className="grid grid-cols-3 gap-2">
                {fatos.map(([n, rotulo]) => (
                  <div key={rotulo} className="rounded-xl border border-[#dde5df] bg-white px-2 py-2.5 text-center">
                    <dt className="font-heading text-lg font-bold tabular-nums">{n}</dt>
                    <dd className="text-[11.5px] leading-tight text-[#5a6570]">{rotulo}</dd>
                  </div>
                ))}
              </dl>
            )}
          </header>
        </div>

        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-24">
          <ReservaWidget slug={produto.slug} tipo={produto.tipo} sentido={produto.sentido} modeloPreco={produto.modeloPreco} precoPorPessoa={produto.precoPorPessoa} maxPorCompra={produto.maxPorCompra} veiculos={veiculos} ehAeroporto={ehAeroporto} />
        </aside>

        <div className="grid content-start gap-6 lg:col-start-1 lg:row-start-2">
          <Promessas locale={locale} />
          <Tripadvisor locale={locale} />
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

          {ehAeroporto && (
            <section className="grid gap-3">
              <h2 className="font-heading text-lg font-semibold">{t('como')}</h2>
              <ol className="grid gap-3">
                {[[t('c1'), t('c1d')], [t('c2'), t('c2d')], [t('c3'), t('c3d')]].map(([titulo, texto]) => (
                  <li key={titulo} className="grid grid-cols-[22px_1fr] gap-3 text-[15px]">
                    <span className="mt-0.5 grid h-[22px] w-[22px] place-items-center rounded-full bg-[#1a5c38] text-[11px] font-bold text-white">✓</span>
                    <span><b className="block">{titulo}</b><span className="text-[#5a6570]">{texto}</span></span>
                  </li>
                ))}
              </ol>
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
