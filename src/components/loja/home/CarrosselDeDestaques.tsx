'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/config'
import { Preco } from '../Preco'

export interface SlideDeDestaque {
  href: string
  imagem: string
  titulo: string
  /** "Transfer privativo a partir de", "Passeio privativo a partir de"... */
  texto: string
  preco: number
}

export function CarrosselDeDestaques({ slides }: { slides: SlideDeDestaque[] }) {
  const t = useTranslations('Loja.destaques')
  const faixa = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(0)

  function aoRolar() {
    const el = faixa.current
    const primeiro = el?.querySelector('a')
    if (!el || !primeiro) return
    const i = Math.round(el.scrollLeft / (primeiro.offsetWidth + 12))
    setAtual(Math.max(0, Math.min(slides.length - 1, i)))
  }

  function irPara(i: number) {
    const el = faixa.current
    const primeiro = el?.querySelector('a')
    if (el && primeiro) el.scrollTo({ left: i * (primeiro.offsetWidth + 12), behavior: 'smooth' })
  }

  return (
    <div className="grid gap-3.5">
      <h2 className="font-heading text-xl font-semibold">{t('titulo')}</h2>
      <div
        ref={faixa}
        onScroll={aoRolar}
        role="region"
        aria-roledescription="carousel"
        aria-label={t('titulo')}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="relative flex min-h-[230px] w-[82%] shrink-0 snap-start flex-col justify-end gap-1 overflow-hidden rounded-2xl bg-[#0d2e1c] p-3.5 text-left text-white sm:w-[46%] lg:w-[31%]"
          >
            <Image src={s.imagem} alt="" fill sizes="(min-width: 1024px) 30vw, 82vw" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/95 via-[#0d2e1c]/50 to-[#0d2e1c]/10" />
            <span className="relative mb-auto w-fit rounded-full bg-[#d4a853] px-2.5 py-0.5 text-[11.5px] font-bold text-[#1a1a2e]">{t('tag')}</span>
            <h3 className="relative font-heading text-[19px] font-semibold leading-tight">{s.titulo}</h3>
            <p className="relative text-[13.5px] text-white/90">
              {s.texto} <Preco valor={s.preco} className="font-bold" aproxClassName="ml-1 text-xs font-normal text-white/80" />
            </p>
            <span className="relative mt-0.5 text-[13.5px] font-bold text-[#d4a853]">{t('ver')} →</span>
          </Link>
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.href}
            type="button"
            onClick={() => irPara(i)}
            aria-label={`${i + 1}/${slides.length}`}
            aria-current={i === atual ? 'true' : undefined}
            className={`h-2 rounded-full ${i === atual ? 'w-5 bg-[#1a5c38]' : 'w-2 bg-[#dde5df]'}`}
          />
        ))}
      </div>
    </div>
  )
}
