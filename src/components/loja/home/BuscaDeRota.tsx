'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/config'
import type { RotaDaBusca } from '@/lib/loja/home'
import { Preco } from '../Preco'

const campo = 'w-full rounded-[10px] border-[1.5px] border-[#dde5df] bg-white px-3 py-2.5 text-[15px] focus:border-[#1a5c38] focus:outline-none min-h-[46px]'

/** Busca da primeira tela: origem, destino e data mostram o preço na hora e levam à página do produto. */
export function BuscaDeRota({ rotas, dataMinima }: { rotas: RotaDaBusca[]; dataMinima?: string }) {
  const t = useTranslations('Loja.busca')
  const origens = useMemo(() => [...new Set(rotas.map((r) => r.origem))], [rotas])
  const [origem, setOrigem] = useState(origens[0] ?? '')
  const destinos = useMemo(() => rotas.filter((r) => r.origem === origem), [rotas, origem])
  const [destino, setDestino] = useState(() => rotas.find((r) => r.origem === (origens[0] ?? ''))?.destino ?? '')
  const [data, setData] = useState('')

  const rota = destinos.find((r) => r.destino === destino) ?? destinos[0]
  const principal = rota?.ida ?? rota?.idaVolta
  const href = principal ? `/transfers/${principal.slug}${data ? `?d=${data}` : ''}` : '/transfers'

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="relative mx-3 -mb-9 grid gap-2.5 rounded-2xl bg-white p-3.5 text-[#1a1a2e] shadow-[0_10px_30px_rgba(13,46,28,.25)] sm:mx-0 sm:max-w-md"
    >
      <label className="grid gap-1 text-[12.5px] font-semibold text-[#5a6570]">
        {t('saindoDe')}
        <select
          className={campo}
          value={origem}
          onChange={(e) => {
            setOrigem(e.target.value)
            setDestino(rotas.find((r) => r.origem === e.target.value)?.destino ?? '')
          }}
        >
          {origens.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-[12.5px] font-semibold text-[#5a6570]">
        {t('indoPara')}
        <select className={campo} value={rota?.destino ?? ''} onChange={(e) => setDestino(e.target.value)}>
          {destinos.map((r) => <option key={r.destino} value={r.destino}>{r.destino}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-[12.5px] font-semibold text-[#5a6570]">
        {t('data')}
        <input type="date" className={campo} value={data} min={dataMinima} onChange={(e) => setData(e.target.value)} />
      </label>

      {principal && (
        <div className="flex items-center justify-between gap-2.5 rounded-[10px] bg-[#e6f2ea] px-3 py-2.5">
          <div>
            <Preco valor={principal.preco} className="font-heading text-[22px] font-bold" aproxClassName="ml-1.5 text-xs font-normal text-[#5a6570]" />
            <div className="text-[12.5px] text-[#5a6570]">{t('aPartirDe')}</div>
          </div>
          {rota?.ida && rota.idaVolta && (
            <div className="text-right text-[12.5px] text-[#5a6570]">
              {t('idaVolta')} <Preco valor={rota.idaVolta.preco} className="font-bold text-[#1a1a2e]" semAprox />
            </div>
          )}
        </div>
      )}

      <Link href={href} className="flex items-center justify-center rounded-xl bg-[#1a5c38] px-[18px] py-3.5 text-base font-semibold text-white hover:bg-[#27ae60]">
        {t('ver')}
      </Link>
    </form>
  )
}
