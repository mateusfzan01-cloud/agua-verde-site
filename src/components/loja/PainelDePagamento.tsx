'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { CreditCard, QrCode } from 'lucide-react'
import { iniciarPagamentoAction, simularPagamentoAction } from '@/app/[locale]/acoes'
import { AtualizaSozinho } from './AtualizaSozinho'

type Meio = 'pix' | 'cartao'

export function PainelDePagamento({ pedidoId, expirado }: { pedidoId: string; expirado: boolean }) {
  const t = useTranslations('Loja.pagamento')
  const locale = useLocale()
  const [meio, setMeio] = useState<Meio | null>(null)
  const [pix, setPix] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [erro, setErro] = useState(false)
  const [pendente, comecar] = useTransition()

  if (expirado) {
    return <p role="alert" className="rounded-xl bg-[#fdecec] p-4 text-[#b42318]">{t('expirado')}</p>
  }

  function escolher(m: Meio) {
    setErro(false)
    comecar(async () => {
      const r = await iniciarPagamentoAction(pedidoId, m)
      if (!r.ok) return setErro(true)
      setMeio(m)
      setPix(r.pix ?? null)
    })
  }

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

  const botao = 'flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-semibold disabled:opacity-60'

  return (
    <section className="grid gap-4 rounded-2xl border border-[#dde5df] bg-white p-4 shadow-sm">
      <h2 className="font-heading text-lg font-semibold">{t('escolha')}</h2>

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" disabled={pendente} onClick={() => escolher('pix')} className={`${botao} ${meio === 'pix' ? 'bg-[#1a5c38] text-white' : 'border-2 border-[#1a5c38] text-[#1a5c38]'}`}>
          <QrCode className="h-5 w-5" aria-hidden="true" /> {t('pagarPix')}
        </button>
        <button type="button" disabled={pendente} onClick={() => escolher('cartao')} className={`${botao} ${meio === 'cartao' ? 'bg-[#1a5c38] text-white' : 'border-2 border-[#1a5c38] text-[#1a5c38]'}`}>
          <CreditCard className="h-5 w-5" aria-hidden="true" /> {t('pagarCartao')}
        </button>
      </div>
      {erro && <p role="alert" className="text-sm text-[#b42318]">{t('expirado')}</p>}

      {meio === 'pix' && pix && (
        <div className="grid gap-2 rounded-xl bg-[#e6f2ea] p-4">
          <b>{t('pixTitulo')}</b>
          <p className="text-sm text-[#5a6570]">{t('pixAjuda')}</p>
          <code className="break-all rounded-lg bg-white p-3 text-xs">{pix}</code>
          <button type="button" onClick={copiar} className="rounded-full bg-[#1a5c38] px-4 py-2.5 text-sm font-semibold text-white">
            {copiado ? t('copiado') : t('copiar')}
          </button>
          <p className="text-sm font-semibold text-[#1a5c38]">{t('aguardando')}</p>
        </div>
      )}
      {meio === 'cartao' && (
        <div className="grid gap-1 rounded-xl bg-[#e6f2ea] p-4">
          <b>{t('cartaoTitulo')}</b>
          <p className="text-sm text-[#5a6570]">{t('cartaoAjuda')}</p>
          <p className="text-sm font-semibold text-[#1a5c38]">{t('aguardando')}</p>
        </div>
      )}
      <AtualizaSozinho ativo={meio !== null} />

      <p className="text-[12.5px] text-[#5a6570]">{t('expira')}</p>

      {meio !== null && (
        <div className="grid gap-2 rounded-xl border-2 border-dashed border-[#d4a853] bg-[#f8efd9] p-4">
          <b>{t('simulacaoTitulo')}</b>
          <p className="text-sm">{t('simulacaoAviso')}</p>
          <button
            type="button"
            disabled={pendente}
            onClick={() => comecar(async () => void (await simularPagamentoAction(pedidoId, locale)))}
            className="rounded-full bg-[#1a1a2e] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {t('simular')}
          </button>
        </div>
      )}
    </section>
  )
}
