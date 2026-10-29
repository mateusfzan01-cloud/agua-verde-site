import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { rotasDaBusca } from '@/lib/loja/home'
import { BuscaDeRota } from './BuscaDeRota'
import { HeroVideo } from './HeroVideo'

export async function HeroBusca({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'Loja.home' })
  return (
    // Largura total da tela, mesmo dentro do contêiner da página.
    <section className="relative -mt-6 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] bg-[#0d2e1c] text-white">
      {/* Primeiro quadro do vídeo: a troca foto → vídeo não aparece */}
      <Image src="/images/loja/hero-porto-de-galinhas.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
      <HeroVideo className="opacity-45" />
      <div className="relative mx-auto grid max-w-3xl gap-2.5 px-4 pb-[18px] pt-[22px] sm:px-6 sm:pb-6 sm:pt-10 lg:max-w-6xl lg:px-4 lg:pb-8 lg:pt-16">
        <h1 className="animate-fade-in-up font-heading text-[28px] font-semibold leading-tight text-white sm:text-4xl lg:max-w-3xl lg:text-5xl">{t('titulo')}</h1>
        <div className="animate-fade-in-up grid gap-1 [text-shadow:0_1px_8px_rgba(0,0,0,.55)]" style={{ animationDelay: '150ms' }}>
          <b className="font-heading text-xl font-semibold leading-tight text-white">{t('motorista')}</b>
          <span className="font-heading text-[17px] font-semibold text-[#d4a853]">{t('reserve')}</span>
        </div>
      </div>
      <div className="animate-fade-in-up relative z-10 mx-auto max-w-3xl px-0 sm:px-6 lg:max-w-6xl lg:px-4" style={{ animationDelay: '300ms' }}>
        <BuscaDeRota rotas={rotasDaBusca()} />
      </div>
      <div className="relative h-11" />
    </section>
  )
}
