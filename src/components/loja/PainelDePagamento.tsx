'use client'

import { useEffect, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import QRCode from 'qrcode'
import { simularPagamentoAction } from '@/app/[locale]/acoes'
import { AtualizaSozinho } from './AtualizaSozinho'

/** Tela do Pix (QR Code e copia e cola) ou do cartão, depois que o pedido foi criado. */
export function PainelDePagamento({
  pedidoId,
  meio,
  pix,
  expirado,
}: {
  pedidoId: string
  meio: 'pix' | 'cartao' | null
  pix: string | null
  expirado: boolean
}) {
  const t = useTranslations('Loja.pagamento')
  const locale = useLocale()
  const [qr, setQr] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [pendente, comecar] = useTransition()

  useEffect(() => {
    if (!pix) return
    QRCode.toDataURL(pix, { margin: 1, width: 360, color: { dark: '#0d2e1c', light: '#ffffff' } }).then(setQr).catch(() => setQr(null))
  }, [pix])

  if (expirado) return <p role="alert" className="rounded-xl bg-[#fdecec] p-4 text-[#b42318]">{t('expirado')}</p>

  async function copiar() {
    if (!pix) return
    try {
      await navigator.clipboard.writeText(pix)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* sem permissão da área de transferência: o código continua visível para copiar à mão */
    }
  }

  return (
    <section className="grid gap-3.5 rounded-[14px] border border-[#dde5df] bg-white p-3.5 shadow-sm">
      {meio === 'pix' && pix ? (
        <div className="grid justify-items-center gap-3 text-center">
          <h2 className="font-heading text-xl font-semibold">{t('titulo')}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {qr ? <img src={qr} alt="QR Code Pix" width={180} height={180} className="rounded-lg border border-[#dde5df]" /> : <div className="h-[180px] w-[180px] rounded-lg bg-[#e6f2ea]" />}
          <div className="flex w-full gap-2">
            <input readOnly value={pix} aria-label="Pix copia e cola" className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#dde5df] bg-[#fafbfa] px-3 text-xs" />
            <button type="button" onClick={copiar} className="shrink-0 rounded-[10px] bg-[#1a5c38] px-4 text-sm font-semibold text-white">
              {copiado ? t('copiado') : t('copiar')}
            </button>
          </div>
          <p className="text-[12.5px] text-[#5a6570]">{t('esperando')}</p>
        </div>
      ) : (
        <div className="grid gap-1.5">
          <h2 className="font-heading text-xl font-semibold">{t('cartaoTitulo')}</h2>
          <p className="text-sm text-[#5a6570]">{t('cartaoAjuda')}</p>
          <p className="text-sm font-semibold text-[#1a5c38]">{t('aguardando')}</p>
        </div>
      )}
      <AtualizaSozinho ativo cadaMs={6000} />
      <p className="text-[12.5px] text-[#5a6570]">{t('expira')}</p>

      <div className="grid gap-2 rounded-xl border-2 border-dashed border-[#d4a853] bg-[#f8efd9] p-3.5">
        <b>{t('simTitulo')}</b>
        <p className="text-sm">{t('simAviso')}</p>
        <button
          type="button"
          disabled={pendente}
          onClick={() => comecar(async () => void (await simularPagamentoAction(pedidoId, locale)))}
          className="rounded-xl bg-[#1a1a2e] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {t('simular')}
        </button>
      </div>
    </section>
  )
}
