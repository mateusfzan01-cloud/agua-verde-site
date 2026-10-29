'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/routing'
import { COTACOES_ILUSTRATIVAS, formatarAproximado, moedaConhecida, moedaPadraoDoIdioma } from '@/lib/loja/moeda'

const CHAVE = 'av-moeda'

interface Contexto {
  /** Moeda em que o visitante vê os valores aproximados (a cobrança é sempre em BRL). */
  moeda: string
  escolher: (codigo: string) => void
  /** "≈ US$ 148", ou null quando a moeda é o real. */
  aproximado: (valorEmReais: number) => string | null
}

const MoedaContext = createContext<Contexto | null>(null)

export function MoedaProvider({ children }: { children: ReactNode }) {
  const idioma = useLocale() as Locale
  // Primeira renderização igual à do servidor (padrão do idioma); a escolha guardada entra depois.
  const [escolhida, setEscolhida] = useState<string | null>(null)

  useEffect(() => {
    try {
      const guardada = localStorage.getItem(CHAVE)
      if (guardada && moedaConhecida(guardada)) setEscolhida(guardada)
    } catch {
      /* sem armazenamento: segue com o padrão */
    }
  }, [])

  const escolher = useCallback((codigo: string) => {
    if (!moedaConhecida(codigo)) return
    setEscolhida(codigo)
    try {
      localStorage.setItem(CHAVE, codigo)
    } catch {
      /* ignora */
    }
  }, [])

  const moeda = escolhida ?? moedaPadraoDoIdioma(idioma)

  const valor = useMemo<Contexto>(
    () => ({
      moeda,
      escolher,
      aproximado: (v) => formatarAproximado(v, moeda, idioma, COTACOES_ILUSTRATIVAS),
    }),
    [moeda, escolher, idioma],
  )

  return <MoedaContext.Provider value={valor}>{children}</MoedaContext.Provider>
}

export function useMoeda(): Contexto {
  const ctx = useContext(MoedaContext)
  if (!ctx) throw new Error('useMoeda precisa estar dentro de <MoedaProvider>')
  return ctx
}
