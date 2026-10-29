'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { pedirLinkAction } from '@/app/[locale]/acoes'

const campo = 'w-full rounded-lg border-[1.5px] border-[#dde5df] bg-white px-3 py-2.5 text-[15px] focus:border-[#1a5c38] focus:outline-none'

export function MinhaReservaForm() {
  const t = useTranslations('Loja.minhaReserva')
  const [enviado, setEnviado] = useState(false)
  const [pendente, comecar] = useTransition()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const dados = new FormData(e.currentTarget)
        comecar(async () => {
          await pedirLinkAction(dados)
          setEnviado(true)
        })
      }}
      className="grid gap-4 rounded-2xl border border-[#dde5df] bg-white p-4 shadow-sm"
    >
      <label className="grid gap-1 text-[12.5px] font-semibold text-[#5a6570]">
        {t('numero')}
        <input name="numero" placeholder={t('numeroEx')} required autoComplete="off" className={campo} />
      </label>
      <label className="grid gap-1 text-[12.5px] font-semibold text-[#5a6570]">
        {t('email')}
        <input name="email" type="email" required autoComplete="email" className={campo} />
      </label>
      <button type="submit" disabled={pendente} className="rounded-full bg-[#1a5c38] px-6 py-3.5 font-semibold text-white disabled:opacity-60">
        {t('enviar')}
      </button>
      {/* Sempre a mesma resposta: ninguém descobre quais números existem. */}
      {enviado && <p role="status" className="rounded-lg bg-[#e6f2ea] p-3 text-sm">{t('enviado')}</p>}
    </form>
  )
}
