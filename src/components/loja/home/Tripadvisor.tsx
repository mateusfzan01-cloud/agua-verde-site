import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { TRIPADVISOR } from '@/lib/loja/home'

export async function Tripadvisor({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'Loja.tripadvisor' })
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-[#dde5df] bg-white p-3.5">
      <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-[#34e0a1] text-[#00352a]" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="7" cy="13" r="4" /><circle cx="17" cy="13" r="4" /><circle cx="7" cy="13" r="1.3" fill="currentColor" /><circle cx="17" cy="13" r="1.3" fill="currentColor" />
          <path d="M3 8h18M12 6c-2 0-4 .6-5 2m5-2c2 0 4 .6 5 2" />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[22px] font-bold">{TRIPADVISOR.nota}</span>
          <span className="inline-flex gap-[3px]" aria-label={`${TRIPADVISOR.nota} / 5`}>
            {[1, 1, 1, 1, 0.7].map((v, i) => (
              <i key={i} className="block h-3 w-3 rounded-full border-2 border-[#00aa6c]" style={{ background: v === 1 ? '#00aa6c' : 'linear-gradient(90deg,#00aa6c 70%,transparent 70%)' }} />
            ))}
          </span>
        </div>
        <p className="text-[13px] font-semibold">{t('linha')}</p>
        <p className="text-[12.5px] text-[#5a6570]">{t('nome')}</p>
      </div>
    </div>
  )
}
