'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

/** Aviso fino abaixo do cabeçalho (ex.: alta temporada). Texto na decisão 38; o × esconde até recarregar. */
export function FaixaDeAviso() {
  const t = useTranslations('Loja.destaques')
  const [visivel, setVisivel] = useState(true)
  if (!visivel) return null
  return (
    <div className="flex items-center gap-2 border-b border-[#dde5df] bg-[#f8efd9] py-2 pl-4 pr-2 text-[13px]">
      <p className="mx-auto flex max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] flex-1 leading-snug">
        <span>
          <b>{t('faixa1')}</b> {t('faixa2')}
        </span>
      </p>
      <button type="button" onClick={() => setVisivel(false)} aria-label={t('fechar')} className="h-8 w-8 shrink-0 rounded-lg text-xl leading-none text-[#5a6570]">
        ×
      </button>
    </div>
  )
}
