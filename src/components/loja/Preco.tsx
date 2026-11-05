'use client'

import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/routing'
import { formatarReais } from '@/lib/loja/moeda'
import { useMoeda } from './MoedaProvider'

/** Valor em reais e, quando o visitante escolheu outra moeda, o valor aproximado. */
export function Preco({
  valor,
  centavos = false,
  className = '',
  aproxClassName = 'ml-1 text-xs font-normal text-[#5a6570]',
  semAprox = false,
}: {
  valor: number
  centavos?: boolean
  className?: string
  aproxClassName?: string
  semAprox?: boolean
}) {
  const idioma = useLocale() as Locale
  const { aproximado } = useMoeda()
  const aprox = semAprox ? null : aproximado(valor)
  return (
    <span className={className}>
      <span className="tabular-nums">{formatarReais(valor, idioma, centavos)}</span>
      {aprox && <span className={`${aproxClassName} tabular-nums`}>{aprox}</span>}
    </span>
  )
}

/** Só o valor aproximado (ou nada), para usar ao lado de um texto próprio. */
export function Aproximado({ valor, className = '' }: { valor: number; className?: string }) {
  const { aproximado } = useMoeda()
  const aprox = aproximado(valor)
  return aprox ? <span className={`tabular-nums ${className}`}>{aprox}</span> : null
}
