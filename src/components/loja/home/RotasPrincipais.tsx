import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Clock, MapPin } from 'lucide-react'
import { Link } from '@/i18n/config'
import type { Locale } from '@/i18n/routing'
import type { RotaPrincipal } from '@/lib/loja/home'
import { precoAPartirDe } from '@/lib/loja/precos'
import { Reveal } from '@/components/shared/Reveal'
import { Preco } from '../Preco'

/** Cards grandes das rotas (como na home antiga), com o preço e a reserva da loja. */
export async function RotasPrincipais({ locale, rotas }: { locale: Locale; rotas: RotaPrincipal[] }) {
  const t = await getTranslations({ locale, namespace: 'Loja.rotas' })
  return (
    <section className="grid gap-5">
      <div className="grid gap-1.5">
        <span className="w-fit rounded-full bg-[#1a5c38]/10 px-3 py-1 text-xs font-semibold text-[#1a5c38]">{t('rotulo')}</span>
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{t('titulo')}</h2>
        <p className="text-[15px] text-[#5a6570]">{t('subtitulo')}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rotas.map((rota, index) => {
          const href = `/transfers/${rota.produto.slug}`
          return (
            <Reveal key={rota.produto.slug} delay={(index % 3) * 120}>
              <div className="group h-full overflow-hidden rounded-2xl border border-[#1a5c38]/5 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#1a5c38]/5">
                <Link href={href} className="relative block h-56 overflow-hidden sm:h-64">
                  <Image
                    src={rota.imagem}
                    alt={`${rota.produto.origemPadrao} → ${rota.produto.destinoPadrao}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="scale-[1.2] object-cover transition-transform duration-500 group-hover:scale-[1.25]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  {rota.popular && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#d4a853] px-3 py-1 text-xs font-bold text-white">
                      {t('maisPopular')}
                    </span>
                  )}
                  <span className="absolute inset-x-4 bottom-4 grid gap-1 text-sm text-white">
                    <span className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {rota.produto.origemPadrao}
                    </span>
                    <span className="flex items-center gap-2 text-white/85">
                      <span className="h-px w-4 bg-white/60" aria-hidden="true" />
                      {rota.produto.destinoPadrao}
                    </span>
                  </span>
                </Link>

                <div className="grid gap-4 p-5 sm:p-6">
                  {rota.duracao && (
                    <span className="flex items-center gap-1.5 text-sm text-[#5a6570]">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {rota.duracao}
                    </span>
                  )}
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="mb-1 text-xs text-[#5a6570]">{t('aPartirDe')}</p>
                      <p className="font-heading text-2xl font-bold text-[#1a5c38]">
                        <Preco valor={precoAPartirDe(rota.produto)} />
                        <span className="ml-1.5 text-xs font-normal text-[#5a6570]">{t('porVeiculo')}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Páginas de destino existem só em português */}
                      {rota.landingPage && locale === 'pt' && (
                        <a
                          href={rota.landingPage}
                          className="rounded-full border border-[#1a5c38]/20 px-4 py-2 text-sm font-medium text-[#1a5c38] transition-colors hover:bg-[#1a5c38]/5"
                        >
                          {t('verDetalhes')}
                        </a>
                      )}
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1a5c38] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a5c38]/90"
                      >
                        {t('reservar')}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
