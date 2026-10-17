import { getTranslations } from 'next-intl/server'

export async function LojaFooter() {
  const t = await getTranslations('Loja.rodape')
  return (
    <footer className="mt-16 border-t border-[#dde5df] bg-[#0d2e1c] py-8 text-sm text-white/80">
      <div className="mx-auto grid max-w-6xl gap-3 px-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="/termos-de-uso" className="hover:text-white">{t('termos')}</a>
          <a href="/politica-de-privacidade" className="hover:text-white">{t('privacidade')}</a>
          <a href="https://wa.me/5581999473200" target="_blank" rel="noopener noreferrer" className="hover:text-white">{t('contato')}: (81) 99947-3200</a>
          <a href="https://www.instagram.com/aguaverdeviagens/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
        </div>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} {t('direitos')}</p>
      </div>
    </footer>
  )
}
