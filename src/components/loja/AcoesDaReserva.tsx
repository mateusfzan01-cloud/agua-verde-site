'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { MessageCircle, Pencil, Send, Ban, CircleHelp } from 'lucide-react'
import { reenviarVoucherAction } from '@/app/[locale]/acoes'
import { CancelarReserva } from './CancelarReserva'

const WA = 'https://wa.me/5581999473200'

/** Grade de ações da reserva: reenviar voucher, alterar, não encontro o motorista, cancelar. */
export function AcoesDaReserva({
  token,
  numero,
  ehPasseio,
  cancelamento,
}: {
  token: string
  numero: string
  ehPasseio: boolean
  cancelamento: { automatico: boolean; motivo: string; valor: string; gratisAte: string; arrependimento: boolean }
}) {
  const t = useTranslations('Loja.reserva')
  const [msg, setMsg] = useState<null | { texto: string; wa?: string; abrir?: boolean }>(null)
  const [cancelando, setCancelando] = useState(false)
  const [pendente, comecar] = useTransition()

  const botao = 'grid min-h-[76px] content-center justify-items-center gap-1 rounded-xl border-[1.5px] border-[#dde5df] bg-white px-2 py-3 text-center text-[13px] font-semibold text-[#1a1a2e] hover:bg-[#fafbfa] disabled:opacity-60'
  const icone = 'h-5 w-5 text-[#1a5c38]'

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={botao} disabled={pendente} onClick={() => comecar(async () => { await reenviarVoucherAction(token); setCancelando(false); setMsg({ texto: t('msgReenviar') }) })}>
          <Send className={icone} aria-hidden="true" />
          {t('reenviar')}
        </button>
        <button type="button" className={botao} onClick={() => { setCancelando(false); setMsg({ texto: t('msgAlterar'), wa: `${WA}?text=${encodeURIComponent(t('waAlterar', { numero }))}`, abrir: true }) }}>
          <Pencil className={icone} aria-hidden="true" />
          {ehPasseio ? t('alterarP') : t('alterar')}
        </button>
        <button type="button" className={botao} onClick={() => { setCancelando(false); setMsg({ texto: t('msgPerdido'), wa: `${WA}?text=${encodeURIComponent(t('waPerdido', { numero }))}`, abrir: true }) }}>
          <CircleHelp className={icone} aria-hidden="true" />
          {t('perdido')}
        </button>
        <button type="button" className={botao} onClick={() => { setMsg(null); setCancelando((v) => !v) }}>
          <Ban className={icone} aria-hidden="true" />
          {t('cancelar')}
        </button>
      </div>

      <div aria-live="polite" className="grid gap-2">
        {msg && (
          <div className="grid gap-2 rounded-xl bg-[#e6f2ea] p-3 text-sm">
            <p>{msg.texto}</p>
            {msg.wa && (
              <a href={msg.wa} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 font-semibold text-[#0b3d1f]">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t('abrirWa')}
              </a>
            )}
          </div>
        )}
        {cancelando &&
          (cancelamento.automatico ? (
            <CancelarReserva token={token} valor={cancelamento.valor} gratisAte={cancelamento.gratisAte} arrependimento={cancelamento.arrependimento} aoFechar={() => setCancelando(false)} />
          ) : (
            <div className="grid gap-2 rounded-xl bg-[#f8efd9] p-3 text-sm">
              <p>{t(`resultado.${cancelamento.motivo}` as 'resultado.fora_do_prazo')}</p>
              <a href={`${WA}?text=${encodeURIComponent(t('waAlterar', { numero }))}`} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 font-semibold text-[#0b3d1f]">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t('abrirWa')}
              </a>
            </div>
          ))}
      </div>
    </div>
  )
}
