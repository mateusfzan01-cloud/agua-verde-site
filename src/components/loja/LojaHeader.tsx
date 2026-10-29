import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { Link } from '@/i18n/config'
import { SeletorIdiomaMoeda } from './SeletorIdiomaMoeda'

export async function LojaHeader() {
  const t = await getTranslations('Loja.nav')
  return (
    <header className="sticky top-0 z-40 border-b border-[#dde5df] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] items-center gap-3 px-4 py-2.5">
        <Link href="/transfers" aria-label="Água Verde" className="flex shrink-0 rounded-lg bg-white p-1">
          <Image src="/images/loja/logo-recortado.png" alt="Água Verde Viagens & Receptivos" width={720} height={394} className="h-12 w-auto sm:h-14" priority />
        </Link>
        <nav className="ml-2 hidden items-center gap-5 text-sm font-medium sm:flex">
          <Link href="/transfers" className="hover:text-[#1a5c38]">{t('transfers')}</Link>
          <Link href="/passeios" className="hover:text-[#1a5c38]">{t('passeios')}</Link>
          <Link href="/minha-reserva" className="hover:text-[#1a5c38]">{t('minhaReserva')}</Link>
          {/* Páginas do site antigo (só em português): links comuns, sem prefixo de idioma */}
          <div className="group relative hidden lg:block">
            <button type="button" className="flex items-center gap-1 hover:text-[#1a5c38]" aria-haspopup="true">
              {t('destinos')}
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid w-64 gap-0.5 rounded-xl border border-[#dde5df] bg-white p-2 shadow-lg">
                <a href="/transfer-porto-de-galinhas" className="rounded-lg px-3 py-2 hover:bg-[#e6f2ea] hover:text-[#1a5c38]">{t('destinoPdg')}</a>
                <a href="/transfer-praia-de-carneiros" className="rounded-lg px-3 py-2 hover:bg-[#e6f2ea] hover:text-[#1a5c38]">{t('destinoCarneiros')}</a>
                <a href="/transfer-maragogi" className="rounded-lg px-3 py-2 hover:bg-[#e6f2ea] hover:text-[#1a5c38]">{t('destinoMaragogi')}</a>
              </div>
            </div>
          </div>
          <a href="/quem-somos" className="hidden hover:text-[#1a5c38] lg:inline">{t('quemSomos')}</a>
          <a href="/contato" className="hidden hover:text-[#1a5c38] lg:inline">{t('contato')}</a>
        </nav>
        <span className="flex-1" />
        <SeletorIdiomaMoeda />
        <a
          href="https://wa.me/5581999473200"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('whatsapp')}
          className="grid h-9 w-9 place-items-center rounded-full bg-[#25d366] text-white"
        >
          <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
        </a>
      </div>
    </header>
  )
}
