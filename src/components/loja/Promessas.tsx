import { getTranslations } from 'next-intl/server'
import { BadgeCheck, CalendarX2, PlaneTakeoff, Timer } from 'lucide-react'
import type { Locale } from '@/i18n/routing'

export async function Promessas({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'Loja.promessas' })
  const itens = [
    { icone: BadgeCheck, t: t('p1t'), d: t('p1d') },
    { icone: CalendarX2, t: t('p2t'), d: t('p2d') },
    { icone: PlaneTakeoff, t: t('p3t'), d: t('p3d') },
    { icone: Timer, t: t('p4t'), d: t('p4d') },
  ]
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {itens.map(({ icone: Icone, t: titulo, d }) => (
        <li key={titulo} className="grid content-start gap-1 rounded-xl border border-[#dde5df] bg-white p-3">
          <Icone className="h-5 w-5 text-[#1a5c38]" aria-hidden="true" />
          <b className="text-sm">{titulo}</b>
          <span className="text-[12.5px] leading-snug text-[#5a6570]">{d}</span>
        </li>
      ))}
    </ul>
  )
}
