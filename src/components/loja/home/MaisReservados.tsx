'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/config'
import type { Locale } from '@/i18n/routing'
import { Preco } from '../Preco'

export interface ItemDaLista {
  href: string
  nome: Record<Locale, string>
  imagem: string | null
  preco: number
  porPessoa: boolean
  rank?: number
}

export function MaisReservados({ transfers, passeios }: { transfers: ItemDaLista[]; passeios: ItemDaLista[] }) {
  const t = useTranslations('Loja.maisReservados')
  const locale = useLocale() as Locale
  const [aba, setAba] = useState<'transfer' | 'passeio'>('transfer')
  const itens = aba === 'transfer' ? transfers : passeios

  return (
    <div className="grid gap-3.5">
      <h2 className="font-heading text-xl font-semibold">{t('titulo')}</h2>
      <div className="flex gap-1.5" role="group">
        {(['transfer', 'passeio'] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={aba === id}
            onClick={() => setAba(id)}
            className={`flex-1 rounded-full border-[1.5px] px-2 py-2 font-semibold ${aba === id ? 'border-[#1a5c38] bg-[#e6f2ea] text-[#1a5c38]' : 'border-[#dde5df] bg-white text-[#5a6570]'}`}
          >
            {id === 'transfer' ? t('transfers') : t('passeios')}
          </button>
        ))}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((i) => (
          <Link key={i.href} href={i.href} className="grid grid-cols-[92px_1fr] items-center gap-3 rounded-[14px] border border-[#dde5df] bg-white p-2 text-left">
            <div className="relative h-[76px] w-[92px] overflow-hidden rounded-[10px] bg-[#e6f2ea]">
              {i.imagem && <Image src={i.imagem} alt="" fill sizes="92px" className="object-cover" />}
            </div>
            <div className="grid min-w-0 gap-0.5">
              {i.rank && <span className="text-[11px] font-bold uppercase tracking-wider text-[#9a3412]">{t('rank', { n: i.rank })}</span>}
              <span className="line-clamp-2 text-sm font-semibold leading-snug">{i.nome[locale]}</span>
              <span className="text-xs text-[#5a6570]">
                {t('aPartirDe')} <Preco valor={i.preco} className="font-heading text-[17px] font-bold text-[#1a1a2e]" aproxClassName="ml-1 text-xs font-normal text-[#5a6570]" />{' '}
                {i.porPessoa ? t('porPessoa') : t('porVeiculo')}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Link href={aba === 'transfer' ? '/transfers' : '/passeios'} className="text-center text-[15px] font-bold text-[#1a5c38] underline">
        {aba === 'transfer' ? t('verTodosTransfers') : t('verTodosPasseios')}
      </Link>
    </div>
  )
}
