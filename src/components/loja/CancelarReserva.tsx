'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cancelarReservaAction } from '@/app/[locale]/acoes'

export function CancelarReserva({ token, gratisAte, arrependimento }: { token: string; gratisAte: string; arrependimento: boolean }) {
  const t = useTranslations('Loja.reserva')
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [pendente, comecar] = useTransition()

  function cancelar() {
    comecar(async () => {
      const r = await cancelarReservaAction(token)
      setConfirmando(false)
      setResultado(r.motivo)
      if (r.ok) router.refresh()
    })
  }

  return (
    <section className="grid gap-3 rounded-2xl border border-[#dde5df] bg-white p-4 shadow-sm">
      <h2 className="font-heading text-lg font-semibold">{t('cancelarTitulo')}</h2>
      <p className="text-sm text-[#5a6570]">
        {t('gratisAte')} <b>{gratisAte}</b>.
      </p>
      {arrependimento && <p className="rounded-lg bg-[#e6f2ea] p-3 text-sm">{t('arrependimentoMsg')}</p>}

      {resultado && (
        <p role="status" className="rounded-lg bg-[#f8efd9] p-3 text-sm">
          {t(`resultado.${resultado}` as 'resultado.arrependimento')}
        </p>
      )}

      {!confirmando ? (
        <button type="button" onClick={() => setConfirmando(true)} className="rounded-full border-2 border-[#b42318] px-5 py-3 font-semibold text-[#b42318]">
          {t('cancelar')}
        </button>
      ) : (
        <div className="grid gap-2">
          <p className="text-sm font-semibold">{t('confirmarCancelar')}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={pendente} onClick={cancelar} className="rounded-full bg-[#b42318] px-4 py-3 font-semibold text-white disabled:opacity-60">
              {t('sim')}
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className="rounded-full border-2 border-[#dde5df] px-4 py-3 font-semibold">
              {t('nao')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
