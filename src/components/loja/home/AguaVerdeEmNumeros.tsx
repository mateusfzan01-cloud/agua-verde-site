import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ShieldCheck } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { CONTADOR_ATUALIZA_SOZINHO, FOTO_FROTA, MOTORISTAS, TRIPADVISOR, VIAGENS_REALIZADAS } from '@/lib/loja/home'
import { CountUp } from '@/components/shared/CountUp'
import { cn } from '@/lib/utils'

export type VarianteDosNumeros = 'numeros' | 'foto' | 'fotoNumeros'

/**
 * Card de prova ao lado do exemplo do acompanhamento, com a mesma altura dele.
 * - numeros: painel claro com 4 números (viagens, Tripadvisor, motoristas, idiomas)
 * - foto: foto da frota com as viagens em destaque
 * - fotoNumeros: os 4 números sobre a foto da frota
 * O selo "Atualizado a cada hora" só aparece quando o contador vier do banco (CONTADOR_ATUALIZA_SOZINHO).
 */
export async function AguaVerdeEmNumeros({ locale, variante }: { locale: Locale; variante: VarianteDosNumeros }) {
  const t = await getTranslations({ locale, namespace: 'Loja.contador' })
  const tagIdioma = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-AR' : 'en-GB'
  const comFoto = variante !== 'numeros'

  const numeros = [
    { valor: <CountUp value={VIAGENS_REALIZADAS} localeTag={tagIdioma} />, rotulo: t('prova') },
    { valor: TRIPADVISOR.nota, rotulo: t('tripadvisor'), detalhe: t('avaliacoes', { n: TRIPADVISOR.avaliacoes }) },
    { valor: <CountUp value={MOTORISTAS} localeTag={tagIdioma} />, rotulo: t('motoristas') },
    { valor: '3', rotulo: t('idiomas'), detalhe: t('idiomasLista') },
  ]

  const seguro = (
    <p
      className={cn(
        'flex items-center gap-[9px] rounded-xl px-3 py-2.5 text-[15px]',
        comFoto ? 'bg-white/15 text-white backdrop-blur-sm' : 'bg-[#f8efd9]'
      )}
    >
      <ShieldCheck className={cn('h-5 w-5 shrink-0', comFoto ? 'text-[#d4a853]' : 'text-[#1a5c38]')} aria-hidden="true" />
      <span>
        <strong>{t('seguro1')}</strong>
        {t('seguro2')}
      </span>
    </p>
  )

  const selo = CONTADOR_ATUALIZA_SOZINHO && (
    <div className="inline-flex w-fit items-center gap-[7px] rounded-full bg-[#e6f2ea] px-[11px] py-1 text-xs font-bold text-[#1a5c38]">
      <span className="h-2 w-2 rounded-full bg-[#27ae60] motion-safe:animate-pulse" aria-hidden="true" />
      {t('live')}
    </div>
  )

  return (
    <div
      className={cn(
        'relative flex h-full min-h-[320px] flex-col gap-4 overflow-hidden rounded-[14px] p-4 sm:p-5',
        comFoto ? 'bg-[#0d2e1c] text-white' : 'border border-[#dde5df] bg-white'
      )}
    >
      {comFoto && (
        <>
          <Image src={FOTO_FROTA} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          <span
            className={cn(
              'absolute inset-0',
              variante === 'foto'
                ? 'bg-gradient-to-t from-[#0d2e1c]/95 via-[#0d2e1c]/45 to-[#0d2e1c]/10'
                : 'bg-[#0d2e1c]/75'
            )}
            aria-hidden="true"
          />
        </>
      )}

      <div className="relative flex items-center justify-between gap-2">
        <span className={cn('text-xs font-semibold uppercase tracking-wider', comFoto ? 'text-white/80' : 'text-[#5a6570]')}>
          {t('emNumeros')}
        </span>
        {selo}
      </div>

      {variante === 'foto' ? (
        <div className="relative mt-auto grid gap-1">
          <span className="font-heading text-[56px] font-bold leading-none tabular-nums text-white sm:text-[64px]">
            <CountUp value={VIAGENS_REALIZADAS} localeTag={tagIdioma} />
          </span>
          <b className="font-heading text-2xl">{t('prova')}</b>
          <span className="text-sm text-white/85">
            {t('tripadvisor')} {TRIPADVISOR.nota} · {t('avaliacoes', { n: TRIPADVISOR.avaliacoes })}
          </span>
        </div>
      ) : (
        <div className="relative grid flex-1 grid-cols-2 gap-3">
          {numeros.map((n) => (
            <div
              key={n.rotulo}
              className={cn(
                'flex flex-col justify-center gap-1 rounded-xl p-3 sm:p-4',
                comFoto ? 'bg-white/10 backdrop-blur-sm' : 'bg-[#f4f7f5]'
              )}
            >
              <span
                className={cn(
                  'font-heading text-[34px] font-bold leading-none tabular-nums sm:text-[40px]',
                  comFoto ? 'text-white' : 'text-[#1a5c38]'
                )}
              >
                {n.valor}
              </span>
              <b className="font-heading text-[15px] leading-tight sm:text-base">{n.rotulo}</b>
              {n.detalhe && <small className={cn('text-xs', comFoto ? 'text-white/75' : 'text-[#5a6570]')}>{n.detalhe}</small>}
            </div>
          ))}
        </div>
      )}

      <div className="relative">{seguro}</div>
    </div>
  )
}
