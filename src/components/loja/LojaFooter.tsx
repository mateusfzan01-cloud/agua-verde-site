import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/config'

export async function LojaFooter() {
  const t = await getTranslations('Loja.rodape')
  const r = await getTranslations('Loja.rodape2')
  const n = await getTranslations('Loja.nav')
  return (
    <footer className="mt-16 bg-[#0d2e1c] py-6 text-[12.5px] text-[#b9cbbf]">
      <div className="mx-auto grid max-w-3xl gap-1.5 px-4 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px]">
        <b className="text-white">{r('empresa')}</b>
        <span>{r('endereco')}</span>
        <span>{r('contato')}</span>
        <a href="https://www.instagram.com/aguaverdeviagens/" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 py-1 font-semibold text-white hover:underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
          Instagram @aguaverdeviagens
        </a>
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="/transfer-porto-de-galinhas" className="hover:text-white">{n('destinoPdg')}</a>
          <span aria-hidden="true">·</span>
          <a href="/transfer-praia-de-carneiros" className="hover:text-white">{n('destinoCarneiros')}</a>
          <span aria-hidden="true">·</span>
          <a href="/transfer-maragogi" className="hover:text-white">{n('destinoMaragogi')}</a>
          <span aria-hidden="true">·</span>
          <a href="/quem-somos" className="hover:text-white">{n('quemSomos')}</a>
          <span aria-hidden="true">·</span>
          <a href="/contato" className="hover:text-white">{n('contato')}</a>
        </span>
        <span className="flex flex-wrap gap-x-3">
          <a href="/termos-de-uso" className="hover:text-white">{t('termos')}</a>
          <span aria-hidden="true">·</span>
          <a href="/politica-de-privacidade" className="hover:text-white">{t('privacidade')}</a>
          <span aria-hidden="true">·</span>
          <Link href="/minha-reserva" className="hover:text-white">{n('minhaReserva')}</Link>
        </span>
      </div>
    </footer>
  )
}
