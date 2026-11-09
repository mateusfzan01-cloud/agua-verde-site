'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { Globe, Check, X, CircleDollarSign } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/config'
import type { Locale } from '@/i18n/routing'
import { COTACOES_ILUSTRATIVAS, MOEDAS_DO_TOPO, nomeDaMoeda, simboloDaMoeda } from '@/lib/loja/moeda'
import { useMoeda } from './MoedaProvider'

const IDIOMAS: { codigo: Locale; nome: string }[] = [
  { codigo: 'pt', nome: 'Português' },
  { codigo: 'es', nome: 'Español' },
  { codigo: 'en', nome: 'English' },
]

/** Botão "PT/BRL R$" que abre uma janela com as abas Idioma e Moeda. */
export function SeletorIdiomaMoeda() {
  const t = useTranslations('Loja.idioma')
  const idioma = useLocale() as Locale
  const { moeda, escolher } = useMoeda()
  const router = useRouter()
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)
  const [aba, setAba] = useState<'idioma' | 'moeda'>('idioma')

  useEffect(() => {
    if (!aberto) return
    const fechaComEsc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('keydown', fechaComEsc)
    return () => document.removeEventListener('keydown', fechaComEsc)
  }, [aberto])

  const todas = useMemo(
    () =>
      Object.keys(COTACOES_ILUSTRATIVAS.reaisPorUnidade).sort((a, b) =>
        nomeDaMoeda(a, idioma).localeCompare(nomeDaMoeda(b, idioma), idioma),
      ),
    [idioma],
  )

  function trocarIdioma(novo: Locale) {
    // Mantém a página e os dados da URL (ex.: a escolha de veículos no checkout).
    router.replace(pathname + (typeof window !== 'undefined' ? window.location.search : ''), { locale: novo })
  }

  const opcaoDeMoeda = (codigo: string) => {
    const simbolo = simboloDaMoeda(codigo, idioma)
    const marcada = codigo === moeda
    return (
      <button
        key={codigo}
        type="button"
        onClick={() => {
          escolher(codigo)
          setAberto(false)
        }}
        aria-pressed={marcada}
        className={`flex min-h-11 items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold hover:bg-[#e6f2ea] ${marcada ? 'bg-[#e6f2ea] text-[#1a5c38]' : 'text-[#1a1a2e]'}`}
      >
        <span>
          {nomeDaMoeda(codigo, idioma)}
          <small className="ml-1 font-semibold text-[#5a6570]">{simbolo === codigo ? codigo : `${codigo} ${simbolo}`}</small>
        </span>
        {marcada && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAba('idioma')
          setAberto(true)
        }}
        aria-haspopup="dialog"
        aria-label={t('abrir')}
        className="flex items-center gap-1.5 rounded-full border border-[#dde5df] bg-white px-2.5 py-1.5 text-xs font-bold text-[#1a1a2e] hover:bg-[#fafbfa]"
      >
        <Globe className="h-4 w-4 text-[#1a5c38]" aria-hidden="true" />
        <span>
          {idioma.toUpperCase()}/{moeda} {simboloDaMoeda(moeda, idioma)}
        </span>
      </button>

      {aberto &&
        // Fora do <header>: o desfoque do cabeçalho prenderia a janela (position: fixed) dentro dele.
        createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[#0d2e1c]/45 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && setAberto(false)}
        >
          <div role="dialog" aria-modal="true" aria-label={t('titulo')} className="grid max-h-[88vh] w-full max-w-md content-start gap-3 overflow-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <b className="font-heading text-lg">{t('titulo')}</b>
              <button type="button" onClick={() => setAberto(false)} aria-label={t('fechar')} className="grid h-9 w-9 place-items-center rounded-lg bg-[#e6f2ea] text-[#1a5c38]">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div role="tablist" className="grid grid-cols-2 border-b border-[#dde5df]">
              {(['idioma', 'moeda'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={aba === id}
                  onClick={() => setAba(id)}
                  className={`-mb-px flex items-center justify-center gap-2 border-b-[3px] py-3 text-[15px] font-bold ${aba === id ? 'border-[#1a5c38] text-[#1a5c38]' : 'border-transparent text-[#5a6570]'}`}
                >
                  {id === 'idioma' ? <Globe className="h-[18px] w-[18px]" aria-hidden="true" /> : <CircleDollarSign className="h-[18px] w-[18px]" aria-hidden="true" />}
                  {t(id)}
                </button>
              ))}
            </div>

            {aba === 'idioma' ? (
              <div className="grid gap-1">
                {IDIOMAS.map((i) => (
                  <button
                    key={i.codigo}
                    type="button"
                    onClick={() => {
                      trocarIdioma(i.codigo)
                      setAberto(false)
                    }}
                    aria-pressed={i.codigo === idioma}
                    className={`flex min-h-11 items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold hover:bg-[#e6f2ea] ${i.codigo === idioma ? 'bg-[#e6f2ea] text-[#1a5c38]' : ''}`}
                  >
                    {i.nome}
                    {i.codigo === idioma && <Check className="h-4 w-4" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5a6570]">{t('maisUsadas')}</span>
                <div className="grid grid-cols-2 gap-1">{MOEDAS_DO_TOPO.map(opcaoDeMoeda)}</div>
                <hr className="border-[#dde5df]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5a6570]">{t('todas')}</span>
                <div className="grid grid-cols-2 gap-1">{todas.map(opcaoDeMoeda)}</div>
              </div>
            )}

            <p className="text-xs text-[#5a6570]">{t('nota')}</p>
          </div>
        </div>,
          document.body,
        )}
    </>
  )
}
