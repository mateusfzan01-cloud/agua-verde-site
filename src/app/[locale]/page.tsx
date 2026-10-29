import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { precoAPartirDe } from '@/lib/loja/precos'
import { maisReservados, slidesDeDestaque } from '@/lib/loja/home'
import type { Produto } from '@/lib/loja/tipos'
import { AcompanhamentoExemplo } from '@/components/loja/home/AcompanhamentoExemplo'
import { CarrosselDeDestaques, type SlideDeDestaque } from '@/components/loja/home/CarrosselDeDestaques'
import { ContadorDeViagens } from '@/components/loja/home/ContadorDeViagens'
import { HeroBusca } from '@/components/loja/home/HeroBusca'
import { MaisReservados, type ItemDaLista } from '@/components/loja/home/MaisReservados'
import { Tripadvisor } from '@/components/loja/home/Tripadvisor'
import { Promessas } from '@/components/loja/Promessas'
import { Reveal } from '@/components/shared/Reveal'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: locale === 'pt' ? '/' : `/${locale}`, languages: { pt: '/', es: '/es', en: '/en' } },
  }
}

const paraLista = (p: Produto, rank?: number): ItemDaLista => ({
  href: `/${p.tipo === 'transfer' ? 'transfers' : 'passeios'}/${p.slug}`,
  nome: p.nome,
  imagem: p.imagens[0] ?? null,
  preco: precoAPartirDe(p),
  porPessoa: p.modeloPreco === 'por_pessoa',
  rank,
})

/**
 * Home da loja, igual ao protótipo aprovado: topo com busca de rota, promessas, destaques,
 * Tripadvisor, mais reservados, contador e exemplo do link de acompanhamento.
 * Serve /es e /en; em português ela responde em "/" quando a loja está habilitada (ver middleware).
 */
export default async function HomeDaLoja({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const l: Locale = locale
  const td = await getTranslations({ locale: l, namespace: 'Loja.destaques' })

  const slides: SlideDeDestaque[] = slidesDeDestaque().flatMap(({ tipo, produto }) =>
    produto.imagens[0]
      ? [{
          href: `/${tipo === 'transfer' ? 'transfers' : 'passeios'}/${produto.slug}`,
          imagem: produto.imagens[0],
          titulo: produto.nome[l],
          texto: tipo === 'transfer' ? td('transferDe') : td('passeioDe'),
          preco: precoAPartirDe(produto),
        }]
      : [],
  )

  return (
    <div className="grid gap-0">
      <HeroBusca locale={l} />
      <div className="mx-auto grid w-full max-w-3xl gap-8 pt-6">
        <Reveal>
          <Promessas locale={l} />
        </Reveal>
        <Reveal>
          <CarrosselDeDestaques slides={slides} />
        </Reveal>
        <Reveal>
          <Tripadvisor locale={l} />
        </Reveal>
        <Reveal>
          <MaisReservados
            transfers={maisReservados('transfer').map((i) => paraLista(i.produto, i.rank))}
            passeios={maisReservados('passeio').map((i) => paraLista(i.produto, i.rank))}
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <Reveal>
            <ContadorDeViagens locale={l} />
          </Reveal>
          <Reveal delay={150}>
            <AcompanhamentoExemplo />
          </Reveal>
        </div>
      </div>
    </div>
  )
}
