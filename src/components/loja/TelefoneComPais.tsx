'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import * as Bandeiras from 'country-flag-icons/react/3x2'
import { intlLocale, type Locale } from '@/i18n/routing'
import { montarTelefone, paisPadraoDoIdioma, paisPorIso, PAISES } from '@/lib/loja/paises'

type Componente = (props: React.SVGProps<SVGSVGElement>) => React.ReactNode
const mapa = Bandeiras as unknown as Record<string, Componente>

function Bandeira({ iso, className = 'h-4 w-6' }: { iso: string; className?: string }) {
  const C = mapa[iso]
  return C ? <C className={`${className} rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,.12)]`} aria-hidden="true" /> : null
}

/**
 * Campo de WhatsApp com seletor de país (bandeira e código), como nos outros sites de reserva.
 * Entrega o número completo em formato internacional no input escondido `name`.
 */
export function TelefoneComPais({
  name,
  label,
  ajuda,
  erro,
  onChange,
}: {
  name: string
  label: string
  ajuda?: string
  erro?: string | null
  onChange?: (telefone: string) => void
}) {
  const t = useTranslations('Loja.checkout')
  const idioma = useLocale() as Locale
  const [iso, setIso] = useState(paisPadraoDoIdioma(idioma))
  const [digitado, setDigitado] = useState('')
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const caixa = useRef<HTMLDivElement>(null)

  const nomes = useMemo(() => {
    const dn = new Intl.DisplayNames([intlLocale[idioma]], { type: 'region' })
    return Object.fromEntries(PAISES.map((p) => [p.iso, dn.of(p.iso) ?? p.iso]))
  }, [idioma])

  const completo = montarTelefone(iso, digitado)
  useEffect(() => onChange?.(completo), [completo, onChange])

  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => caixa.current && !caixa.current.contains(e.target as Node) && setAberto(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])

  const filtrados = PAISES.filter((p) => {
    const q = busca.trim().toLowerCase()
    return !q || nomes[p.iso].toLowerCase().includes(q) || p.dial.startsWith(q.replace('+', '')) || p.iso.toLowerCase() === q
  })
  const atual = paisPorIso(iso)

  return (
    <div className="grid gap-1 text-[12.5px] font-semibold text-[#5a6570]" ref={caixa}>
      <label htmlFor={`${name}-numero`}>{label}</label>
      <div className="relative flex gap-2">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={aberto}
          aria-label={`${t('pais')}: ${nomes[iso]} +${atual.dial}`}
          className={`flex min-h-[46px] shrink-0 items-center gap-1.5 rounded-[10px] border-[1.5px] bg-white px-2.5 text-[15px] font-medium text-[#1a1a2e] ${erro ? 'border-[#b42318]' : 'border-[#dde5df]'}`}
        >
          <Bandeira iso={iso} />
          <span className="tabular-nums">+{atual.dial}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#5a6570]" aria-hidden="true" />
        </button>
        <input
          id={`${name}-numero`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={digitado}
          onChange={(e) => setDigitado(e.target.value)}
          className={`min-h-[46px] w-full min-w-0 rounded-[10px] border-[1.5px] bg-white px-3 text-[15px] font-medium text-[#1a1a2e] focus:border-[#1a5c38] focus:outline-none ${erro ? 'border-[#b42318]' : 'border-[#dde5df]'}`}
        />
        <input type="hidden" name={name} value={completo} />

        {aberto && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-30 grid w-[min(20rem,100%)] gap-1 rounded-xl border border-[#dde5df] bg-white p-2 shadow-xl">
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={t('buscarPais')}
              aria-label={t('buscarPais')}
              className="min-h-10 rounded-lg border border-[#dde5df] px-3 text-[14px] font-normal text-[#1a1a2e]"
            />
            <ul role="listbox" className="max-h-64 overflow-auto">
              {filtrados.map((p) => (
                <li key={p.iso} role="option" aria-selected={p.iso === iso}>
                  <button
                    type="button"
                    onClick={() => {
                      setIso(p.iso)
                      setAberto(false)
                      setBusca('')
                    }}
                    className={`flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[14px] font-medium text-[#1a1a2e] hover:bg-[#e6f2ea] ${p.iso === iso ? 'bg-[#e6f2ea]' : ''}`}
                  >
                    <Bandeira iso={p.iso} />
                    <span className="min-w-0 flex-1 truncate">{nomes[p.iso]}</span>
                    <span className="tabular-nums text-[#5a6570]">+{p.dial}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {ajuda && <small className="font-normal">{ajuda}</small>}
      {erro && <span role="alert" className="text-xs font-semibold text-[#b42318]">{erro}</span>}
    </div>
  )
}
