import { getTranslations } from 'next-intl/server'
import { BadgeCheck, CalendarX2, PlaneTakeoff, Timer } from 'lucide-react'
import type { Locale } from '@/i18n/routing'

/** As 4 promessas. `compacta` tira as caixas (usada embaixo do resumo do checkout). */
export async function Promessas({ locale, compacta = false }: { locale: Locale; compacta?: boolean }) {
  const t = await getTranslations({ locale, namespace: 'Loja.promessas' })
  const itens = [
    { icone: BadgeCheck, t: t('p1t'), d: t('p1d') },
    { icone: CalendarX2, t: t('p2t'), d: t('p2d') },
    { icone: PlaneTakeoff, t: t('p3t'), d: t('p3d') },
    { icone: Timer, t: t('p4t'), d: t('p4d') },
  ]
  return (
    <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {itens.map(({ icone: Icone, t: titulo, d }) => (
        <li
          key={titulo}
          className={`flex items-start gap-[9px] text-[13px] leading-snug ${compacta ? 'py-1' : 'rounded-xl border border-[#dde5df] bg-white p-2.5'}`}
        >
          <Icone className="mt-0.5 h-5 w-5 shrink-0 text-[#27ae60]" aria-hidden="true" />
          <span>
            <b className="block text-[13.5px]">{titulo}</b>
            <span className="text-[12.5px] text-[#5a6570]">{d}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
