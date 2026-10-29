'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

const GAP = 12
const INTERVALO_MS = 5000

/**
 * Carrossel "Em destaque". No celular mostra um pedaço do próximo card (convite para arrastar);
 * no computador, 3 cards inteiros com setas. Passa sozinho a cada 5 s: pausa com o mouse em cima
 * ou com foco dentro, e para de vez quando a pessoa mexe nele. Não passa sozinho com
 * "reduzir movimento".
 */
export function CarrosselDeDestaques({ slides }: { slides: SlideDeDestaque[] }) {
  const t = useTranslations('Loja.destaques')
  const faixa = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(0)
  // Quantas posições de rolagem existem (com 3 cards visíveis e 4 slides, são 2)
  const [posicoes, setPosicoes] = useState(slides.length)
  const [pausado, setPausado] = useState(false)
  const [mexeu, setMexeu] = useState(false)
  const atualRef = useRef(0)
  atualRef.current = atual

  const larguraDoPasso = useCallback(() => {
    const primeiro = faixa.current?.querySelector('a')
    return primeiro ? primeiro.offsetWidth + GAP : 0
  }, [])

  const medir = useCallback(() => {
    const el = faixa.current
    const passo = larguraDoPasso()
    if (!el || !passo) return
    const visiveis = Math.max(1, Math.round((el.clientWidth + GAP) / passo))
    setPosicoes(Math.max(1, slides.length - visiveis + 1))
  }, [larguraDoPasso, slides.length])

  useEffect(() => {
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [medir])

  function aoRolar() {
    const el = faixa.current
    const passo = larguraDoPasso()
    if (!el || !passo) return
    // No fim da faixa, a última posição (o scroll pode não chegar a um múltiplo exato do passo)
    const noFim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    const i = noFim ? posicoes - 1 : Math.round(el.scrollLeft / passo)
    setAtual(Math.max(0, Math.min(posicoes - 1, i)))
  }

  const irPara = useCallback(
    (i: number) => {
      const el = faixa.current
      const passo = larguraDoPasso()
      if (el && passo) el.scrollTo({ left: i * passo, behavior: 'smooth' })
    },
    [larguraDoPasso]
  )

  function navegar(i: number) {
    setMexeu(true)
    irPara(i)
  }

  useEffect(() => {
    if (mexeu || pausado || posicoes < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      if (document.hidden) return
      irPara(atualRef.current + 1 >= posicoes ? 0 : atualRef.current + 1)
    }, INTERVALO_MS)
    return () => window.clearInterval(id)
  }, [mexeu, pausado, posicoes, irPara])

  const botaoSeta =
    'grid h-9 w-9 place-items-center rounded-full border border-[#dde5df] bg-white text-[#1a5c38] transition-colors hover:bg-[#e6f2ea] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white'

  return (
    <div
      className="grid gap-3.5"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold">{t('titulo')}</h2>
        {posicoes > 1 && (
          <div className="hidden gap-2 lg:flex">
            <button type="button" onClick={() => navegar(atual - 1)} disabled={atual === 0} aria-label={t('anterior')} className={botaoSeta}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => navegar(atual + 1)}
              disabled={atual >= posicoes - 1}
              aria-label={t('proximo')}
              className={botaoSeta}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={faixa}
        onScroll={aoRolar}
        onTouchStart={() => setMexeu(true)}
        onWheel={(e) => Math.abs(e.deltaX) > Math.abs(e.deltaY) && setMexeu(true)}
        role="region"
        aria-roledescription="carousel"
        aria-label={t('titulo')}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="relative flex min-h-[230px] w-[82%] shrink-0 snap-start flex-col justify-end gap-1 overflow-hidden rounded-2xl bg-[#0d2e1c] p-3.5 text-left text-white sm:w-[46%] lg:min-h-[260px] lg:w-[calc((100%-24px)/3)]"
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
      {posicoes > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: posicoes }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navegar(i)}
              aria-label={`${i + 1}/${posicoes}`}
              aria-current={i === atual ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${i === atual ? 'w-5 bg-[#1a5c38]' : 'w-2 bg-[#dde5df]'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
