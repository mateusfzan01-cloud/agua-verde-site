import { getTranslations } from 'next-intl/server'
import { ShieldCheck } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { CONTADOR_ATUALIZA_SOZINHO, VIAGENS_REALIZADAS } from '@/lib/loja/home'

/**
 * "8.211 viagens realizadas". O selo "Atualizado a cada hora" só aparece quando o número
 * for lido do banco de verdade (CONTADOR_ATUALIZA_SOZINHO); antes disso não prometemos o que não existe.
 */
export async function ContadorDeViagens({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'Loja.contador' })
  return (
    <div className="grid gap-2.5 rounded-[14px] border border-[#dde5df] bg-white p-3.5">
      {CONTADOR_ATUALIZA_SOZINHO && (
        <div className="inline-flex w-fit items-center gap-[7px] rounded-full bg-[#e6f2ea] px-[11px] py-1 text-xs font-bold text-[#1a5c38]">
          <span className="h-2 w-2 rounded-full bg-[#27ae60] motion-safe:animate-pulse" aria-hidden="true" />
          {t('live')}
        </div>
      )}
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-heading text-[40px] font-bold leading-none tabular-nums text-[#1a5c38]">
          {VIAGENS_REALIZADAS.toLocaleString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-AR' : 'en-GB')}
        </span>
        <b className="font-heading text-xl">{t('prova')}</b>
      </div>
      <p className="flex items-center gap-[9px] rounded-xl bg-[#f8efd9] px-3 py-2.5 text-[15px]">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[#1a5c38]" aria-hidden="true" />
        <span>
          <strong>{t('seguro1')}</strong>
          {t('seguro2')}
        </span>
      </p>
    </div>
  )
}
