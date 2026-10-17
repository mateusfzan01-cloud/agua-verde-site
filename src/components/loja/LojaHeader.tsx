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
          <Image src="/images/logo-agua-verde.png" alt="Água Verde Viagens & Receptivos" width={120} height={48} className="h-9 w-auto" priority />
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
      <nav className="flex justify-center gap-6 border-t border-[#dde5df] py-2 text-sm font-medium sm:hidden">
        <Link href="/transfers">{t('transfers')}</Link>
        <Link href="/passeios">{t('passeios')}</Link>
        <Link href="/minha-reserva">{t('minhaReserva')}</Link>
      </nav>
    </header>
  )
}
