import { getTranslations } from 'next-intl/server'
import { ShieldCheck } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { CONTADOR_ATUALIZA_SOZINHO, MOTORISTAS, TRIPADVISOR, VIAGENS_REALIZADAS } from '@/lib/loja/home'
import { CountUp } from '@/components/shared/CountUp'

/**
 * "Água Verde em números": viagens, Tripadvisor, motoristas e idiomas, ao lado do exemplo do
 * acompanhamento e com a mesma altura dele. O selo "Atualizado a cada hora" só aparece quando o
 * contador vier do banco (CONTADOR_ATUALIZA_SOZINHO); antes disso não prometemos o que não existe.
 */
export async function AguaVerdeEmNumeros({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'Loja.contador' })
  const tagIdioma = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-AR' : 'en-GB'

  const numeros = [
    { valor: <CountUp value={VIAGENS_REALIZADAS} localeTag={tagIdioma} />, rotulo: t('prova') },
    { valor: TRIPADVISOR.nota, rotulo: t('tripadvisor'), detalhe: t('avaliacoes', { n: TRIPADVISOR.avaliacoes }) },
    { valor: <CountUp value={MOTORISTAS} localeTag={tagIdioma} />, rotulo: t('motoristas') },
    { valor: '3', rotulo: t('idiomas'), detalhe: t('idiomasLista') },
  ]

  return (
    <div className="flex h-full min-h-[320px] flex-col gap-4 rounded-[14px] border border-[#dde5df] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5a6570]">{t('emNumeros')}</span>
        {CONTADOR_ATUALIZA_SOZINHO && (
          <div className="inline-flex w-fit items-center gap-[7px] rounded-full bg-[#e6f2ea] px-[11px] py-1 text-xs font-bold text-[#1a5c38]">
            <span className="h-2 w-2 rounded-full bg-[#27ae60] motion-safe:animate-pulse" aria-hidden="true" />
            {t('live')}
          </div>
        )}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {numeros.map((n) => (
          <div key={n.rotulo} className="flex flex-col justify-center gap-1 rounded-xl bg-[#f4f7f5] p-3 sm:p-4">
            <span className="font-heading text-[34px] font-bold leading-none tabular-nums text-[#1a5c38] sm:text-[40px]">{n.valor}</span>
            <b className="font-heading text-[15px] leading-tight sm:text-base">{n.rotulo}</b>
            {n.detalhe && <small className="text-xs text-[#5a6570]">{n.detalhe}</small>}
          </div>
        ))}
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
