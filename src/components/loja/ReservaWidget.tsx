'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Minus, Plus } from 'lucide-react'
import { useRouter } from '@/i18n/config'
import { calcularPreco } from '@/lib/loja/precos'
import { dataMinimaDeReserva, validarAgenda } from '@/lib/loja/datas'
import { montarQuery } from '@/lib/loja/checkout-url'
import type { ModeloPreco, Sentido, TipoProduto } from '@/lib/loja/tipos'
import { Preco } from './Preco'

export interface VeiculoNoWidget {
  tipo: string
  nome: string
  capacidade: string
  preco: number
}

interface Props {
  slug: string
  tipo: TipoProduto
  sentido: Sentido
  modeloPreco: ModeloPreco
  precoPorPessoa: number | null
  maxPorCompra: number
  veiculos: VeiculoNoWidget[]
}

const campo = 'w-full rounded-lg border-[1.5px] border-[#dde5df] bg-white px-3 py-2.5 text-[15px] focus:border-[#1a5c38] focus:outline-none'

export function ReservaWidget({ slug, tipo, sentido, modeloPreco, precoPorPessoa, maxPorCompra, veiculos }: Props) {
  const t = useTranslations('Loja.produto')
  const router = useRouter()
  const ehTransfer = tipo === 'transfer'
  const ehIdaEVolta = ehTransfer && sentido === 'ida_volta'

  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const [pessoas, setPessoas] = useState(0)
  const [data, setData] = useState('')
  const [hora, setHora] = useState('10:00')
  const [dataVolta, setDataVolta] = useState('')
  const [horaVolta, setHoraVolta] = useState('10:00')
  const [tentou, setTentou] = useState(false)
  const [minima, setMinima] = useState('')

  useEffect(() => setMinima(dataMinimaDeReserva(new Date())), [])

  const selecao = useMemo(
    () => (modeloPreco === 'por_pessoa' ? { pessoas } : { veiculos: quantidades }),
    [modeloPreco, pessoas, quantidades],
  )
  const preco = useMemo(
    () => calcularPreco({ modeloPreco, veiculos: veiculos.map((v) => ({ tipo: v.tipo, preco: v.preco })), precoPorPessoa, maxPorCompra }, selecao),
    [modeloPreco, veiculos, precoPorPessoa, maxPorCompra, selecao],
  )
  const quantidadeTotal = modeloPreco === 'por_pessoa' ? pessoas : Object.values(quantidades).reduce((a, b) => a + b, 0)

  const erros = useMemo(() => {
    const lista: string[] = []
    if (!preco.ok) lista.push(preco.erro)
    lista.push(...validarAgenda({ tipo, sentido, data, hora: ehTransfer ? hora : undefined, dataVolta, horaVolta }, new Date()))
    return [...new Set(lista)]
  }, [preco, tipo, sentido, data, hora, dataVolta, horaVolta, ehTransfer])

  function mudar(tipoVeiculo: string, delta: number) {
    setQuantidades((q) => {
      const novo = Math.max(0, (q[tipoVeiculo] ?? 0) + delta)
      const soma = Object.values(q).reduce((a, b) => a + b, 0) - (q[tipoVeiculo] ?? 0) + novo
      return soma > maxPorCompra ? q : { ...q, [tipoVeiculo]: novo }
    })
  }

  function continuar(e: React.FormEvent) {
    e.preventDefault()
    setTentou(true)
    if (erros.length > 0) return
    router.push(`/checkout?${montarQuery({ slug, selecao, data, hora: ehTransfer ? hora : '', dataVolta: ehIdaEVolta ? dataVolta : '', horaVolta: ehIdaEVolta ? horaVolta : '' })}`)
  }

  const botaoPasso = 'grid h-10 w-10 place-items-center rounded-lg bg-[#e6f2ea] text-[#1a5c38] disabled:opacity-35'

  return (
    <form onSubmit={continuar} className="grid gap-4 rounded-2xl border border-[#dde5df] bg-white p-4 shadow-sm" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 grid gap-1 text-[12.5px] font-semibold text-[#5a6570] sm:col-span-1">
          {ehIdaEVolta ? t('dataIda') : t('data')}
          <input type="date" className={campo} value={data} min={minima || undefined} onChange={(e) => setData(e.target.value)} />
        </label>
        {ehTransfer && (
          <label className="col-span-2 grid gap-1 text-[12.5px] font-semibold text-[#5a6570] sm:col-span-1">
            {ehIdaEVolta ? t('horaIda') : t('hora')}
            <input type="time" step={300} className={campo} value={hora} onChange={(e) => setHora(e.target.value)} />
          </label>
        )}
        {ehIdaEVolta && (
          <>
            <label className="col-span-2 grid gap-1 text-[12.5px] font-semibold text-[#5a6570] sm:col-span-1">
              {t('dataVolta')}
              <input type="date" className={campo} value={dataVolta} min={data || minima || undefined} onChange={(e) => setDataVolta(e.target.value)} />
            </label>
            <label className="col-span-2 grid gap-1 text-[12.5px] font-semibold text-[#5a6570] sm:col-span-1">
              {t('horaVolta')}
              <input type="time" step={300} className={campo} value={horaVolta} onChange={(e) => setHoraVolta(e.target.value)} />
            </label>
          </>
        )}
      </div>
      {!ehTransfer && <p className="text-[12.5px] text-[#5a6570]">{t('horarioCombinado')}</p>}

      {modeloPreco === 'por_veiculo' ? (
        <fieldset className="grid gap-2">
          <legend className="mb-1 font-heading text-base font-semibold">{t('veiculos')}</legend>
          {veiculos.map((v) => {
            const q = quantidades[v.tipo] ?? 0
            return (
              <div key={v.tipo} className={`flex items-center gap-3 rounded-xl border-[1.5px] p-3 ${q > 0 ? 'border-[#1a5c38] bg-[#e6f2ea]' : 'border-[#dde5df]'}`}>
                <div className="min-w-0 flex-1">
                  <b className="block text-[15px]">{v.nome}</b>
                  <span className="block text-[12.5px] text-[#5a6570]">{v.capacidade}</span>
                  <Preco valor={v.preco} className="mt-0.5 block text-[15px] font-bold text-[#1a5c38]" />
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className={botaoPasso} onClick={() => mudar(v.tipo, -1)} disabled={q === 0} aria-label={`${t('diminuir')}: ${v.nome}`}>
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <b className="w-5 text-center tabular-nums" aria-live="polite">{q}</b>
                  <button type="button" className={botaoPasso} onClick={() => mudar(v.tipo, 1)} disabled={quantidadeTotal >= maxPorCompra} aria-label={`${t('aumentar')}: ${v.nome}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )
          })}
          <p className="text-[12.5px] text-[#5a6570]">{ehIdaEVolta ? t('veiculosAvisoIdaVolta') : t('veiculosAviso')} {t('maximo', { n: maxPorCompra })}</p>
        </fieldset>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#dde5df] p-3">
          <div className="min-w-0 flex-1">
            <b className="block text-[15px]">{t('pessoas')}</b>
            <Preco valor={precoPorPessoa ?? 0} className="block text-[15px] font-bold text-[#1a5c38]" />
            <span className="block text-[12.5px] text-[#5a6570]">{t('pessoasAviso')} {t('maximo', { n: maxPorCompra })}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={botaoPasso} onClick={() => setPessoas((n) => Math.max(0, n - 1))} disabled={pessoas === 0} aria-label={t('diminuir')}>
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <b className="w-5 text-center tabular-nums" aria-live="polite">{pessoas}</b>
            <button type="button" className={botaoPasso} onClick={() => setPessoas((n) => Math.min(maxPorCompra, n + 1))} disabled={pessoas >= maxPorCompra} aria-label={t('aumentar')}>
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-3 border-t border-[#dde5df] pt-3">
        <span className="text-sm font-semibold text-[#5a6570]">{t('total')}</span>
        <div className="text-right">
          {preco.ok ? <Preco valor={preco.total} className="text-2xl font-bold" aproxClassName="ml-2 text-sm font-normal text-[#5a6570]" /> : <span className="text-2xl font-bold text-[#dde5df]">—</span>}
        </div>
      </div>

      {tentou && erros.length > 0 && (
        <ul role="alert" className="grid gap-1 rounded-lg bg-[#fdecec] p-3 text-sm text-[#b42318]">
          {erros.map((e) => (
            <li key={e}>{t(`erros.${e}` as 'erros.nada_selecionado')}</li>
          ))}
        </ul>
      )}

      <button type="submit" className="rounded-full bg-[#1a5c38] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#27ae60]">
        {t('continuar')}
      </button>
      {!ehTransfer && <p className="text-center text-[12.5px] text-[#5a6570]">{t('vagaGarantida')}</p>}
    </form>
  )
}
