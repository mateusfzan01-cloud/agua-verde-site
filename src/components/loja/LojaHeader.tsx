import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { MessageCircle } from 'lucide-react'
import { Link } from '@/i18n/config'
import { SeletorIdiomaMoeda } from './SeletorIdiomaMoeda'

export async function LojaHeader() {
  const t = await getTranslations('Loja.nav')
  return (
    <header className="sticky top-0 z-40 border-b border-[#dde5df] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <Link href="/transfers" aria-label="Água Verde" className="flex shrink-0 rounded-lg bg-white p-1">
          <Image src="/images/loja/logo-recortado.png" alt="Água Verde Viagens & Receptivos" width={720} height={394} className="h-12 w-auto sm:h-14" priority />
        </Link>
        <nav className="ml-2 hidden items-center gap-5 text-sm font-medium sm:flex">
          <Link href="/transfers" className="hover:text-[#1a5c38]">{t('transfers')}</Link>
          <Link href="/passeios" className="hover:text-[#1a5c38]">{t('passeios')}</Link>
          <Link href="/minha-reserva" className="hover:text-[#1a5c38]">{t('minhaReserva')}</Link>
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
