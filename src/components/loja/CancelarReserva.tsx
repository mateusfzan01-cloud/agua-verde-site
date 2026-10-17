'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cancelarReservaAction } from '@/app/[locale]/acoes'

/** "Cancelar sem custo?": explica o reembolso (valor e prazo) e só depois cancela. */
export function CancelarReserva({
  token,
  valor,
  gratisAte,
  arrependimento,
  aoFechar,
}: {
  token: string
  valor: string
  gratisAte: string
  arrependimento: boolean
  aoFechar: () => void
}) {
  const t = useTranslations('Loja.reserva')
  const router = useRouter()
  const [resultado, setResultado] = useState<string | null>(null)
  const [pendente, comecar] = useTransition()

  function cancelar() {
    comecar(async () => {
      const r = await cancelarReservaAction(token)
      setResultado(r.motivo)
      if (r.ok) router.refresh()
    })
  }

  return (
    <div className="grid gap-2.5 rounded-xl border-[1.5px] border-[#dde5df] bg-white p-3.5" role="group" aria-label={t('cxTitulo')}>
      <b>{t('cxTitulo')}</b>
      <p className="text-sm text-[#5a6570]">{arrependimento ? t('cxArrep', { valor }) : t('cxIntegral', { valor, ate: gratisAte })}</p>
      {arrependimento && <p className="text-[12.5px] text-[#5a6570]">{t('gratisAte')} <b>{gratisAte}</b>.</p>}
      <p className="text-[12.5px] text-[#5a6570]">{t('cxAviso')}</p>
      {resultado && <p role="status" className="rounded-lg bg-[#f8efd9] p-3 text-sm">{t(`resultado.${resultado}` as 'resultado.arrependimento')}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={pendente} onClick={cancelar} className="rounded-xl bg-[#b42318] px-4 py-3 font-semibold text-white disabled:opacity-60">{t('cxSim')}</button>
        <button type="button" onClick={aoFechar} className="rounded-xl border-[1.5px] border-[#dde5df] px-4 py-3 font-semibold">{t('cxNao')}</button>
      </div>
    </div>
  )
}
