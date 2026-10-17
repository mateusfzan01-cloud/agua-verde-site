'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, ChevronDown, MapPin, MessageCircle } from 'lucide-react'

/** Miniatura da página /acompanhar dentro de um celular moderno; abre recolhida e expande. */
export function AcompanhamentoExemplo() {
  const t = useTranslations('Loja.acompanhamento')
  const [aberto, setAberto] = useState(false)
  const passos = [t('passo1'), t('passo2'), t('passo3'), t('passo4')]

  return (
    <div className="grid gap-2.5 rounded-[14px] border border-[#dde5df] bg-white p-3.5">
      <div className="grid gap-1">
        <b>{t('titulo')}</b>
        <p className="text-[12.5px] text-[#5a6570]">{t('texto')}</p>
      </div>

      <div className="grid justify-items-center gap-2">
        <div className={`relative flex w-full justify-center ${aberto ? '' : 'max-h-[310px] overflow-hidden'}`}>
          <div className="relative w-full max-w-[290px] rounded-[44px] bg-gradient-to-br from-[#3a3f45] to-[#0c0d0f] p-1.5 shadow-[inset_0_0_0_1.5px_#5b6168,0_14px_30px_rgba(13,46,28,.28)]">
            <div className="overflow-hidden rounded-[38px] bg-[#fafbfa]">
              <div className="grid grid-cols-[1fr_84px_1fr] items-center px-5 pb-1 pt-2.5 text-xs font-bold text-[#111]">
                <span>9:41</span>
                <i className="block h-6 w-[84px] rounded-full bg-black" />
                <span className="flex items-center justify-end gap-1" aria-hidden="true">
                  <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="#111" /><rect x="4.3" y="5" width="3" height="6" rx="1" fill="#111" /><rect x="8.6" y="2.5" width="3" height="8.5" rx="1" fill="#111" /><rect x="13" y="0" width="3" height="11" rx="1" fill="#111" /></svg>
                  <svg width="24" height="11" viewBox="0 0 24 11"><rect x=".5" y=".5" width="20" height="10" rx="3" fill="none" stroke="#111" opacity=".5" /><rect x="2" y="2" width="15" height="7" rx="1.8" fill="#111" /><rect x="21.5" y="3.5" width="2" height="4" rx="1" fill="#111" opacity=".5" /></svg>
                </span>
              </div>
              <div className="mx-3.5 mb-0.5 mt-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-[#e9eeea] px-2.5 py-[5px] text-center text-[10.5px] text-[#3d4640]">🔒 {t('url')}</div>

              <div className="grid gap-2.5 px-3 pb-3.5 pt-3 text-[12.5px]">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#2563eb] px-[11px] py-[5px] text-xs font-semibold text-white">🚗 {t('status')}</span>
                <h4 className="font-heading text-lg font-semibold">{t('ola')}</h4>
                <div className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 rounded-xl border border-[#dde5df] bg-white px-3 py-2.5">
                  <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-[#1a5c38] font-heading text-base font-bold text-white" aria-hidden="true">C</span>
                  <div><b>Carlos</b><small className="block text-[11px] text-[#5a6570]">{t('carro')}</small></div>
                  <span className="rounded-full bg-[#e6f2ea] px-2 py-0.5 text-xs font-semibold text-[#1a5c38]">{t('eta')}</span>
                </div>
                <div className="overflow-hidden rounded-xl border border-[#dde5df] bg-white [&>div]:flex [&>div]:items-start [&>div]:gap-2.5 [&>div]:px-3 [&>div]:py-2.5 [&>div+div]:border-t [&>div+div]:border-[#dde5df]">
                  <div>
                    <div className="flex flex-col items-center gap-[3px] pt-1" aria-hidden="true">
                      <i className="h-2 w-2 rounded-full bg-[#1a5c38]" /><u className="h-[22px] w-0.5 bg-[#1a5c38]/20" /><i className="h-2 w-2 rounded-full bg-[#d4a853]" />
                    </div>
                    <div className="grid gap-2">
                      <div><small className="block text-[11px] text-[#5a6570]">{t('origem')}</small><b>{t('exOrigem')}</b></div>
                      <div><small className="block text-[11px] text-[#5a6570]">{t('destino')}</small><b>{t('exDestino')}</b></div>
                    </div>
                  </div>
                  <div>
                    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-[#e6f2ea] text-[#1a5c38]"><Calendar className="h-[15px] w-[15px]" aria-hidden="true" /></span>
                    <div><small className="block text-[11px] text-[#5a6570]">{t('dataHora')}</small><b>{t('exQuando')}</b></div>
                  </div>
                  <div>
                    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-[#e6f2ea] text-[#1a5c38]"><MapPin className="h-[15px] w-[15px]" aria-hidden="true" /></span>
                    <div><small className="block text-[11px] text-[#5a6570]">{t('numero')}</small><b className="font-mono">AV-2026-000123</b></div>
                  </div>
                </div>
                <div className="grid gap-[9px] rounded-xl border border-[#dde5df] bg-[#fafbfa] p-3">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#5a6570]">{t('situacao')}</div>
                  {passos.map((p, i) => (
                    <div key={p} className="flex items-center gap-[9px]">
                      <span className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[11px] font-bold ${i <= 1 ? 'bg-[#1a5c38] text-white' : 'bg-[#e6f2ea] text-[#5a6570]'}`}>{i < 1 ? '✓' : i + 1}</span>
                      <span className={i < 1 ? 'font-semibold text-[#1a5c38]' : i === 1 ? 'font-bold' : ''}>
                        {p}
                        {i === 1 && <em className="ml-1.5 rounded-full bg-[#e6f2ea] px-[7px] py-px text-[10.5px] font-semibold not-italic text-[#1a5c38]">{t('agora')}</em>}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid justify-items-center gap-2 rounded-xl bg-[#0d2e1c] p-3 text-center text-[#e1ece5]">
                  <span>{t('zap')}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25d366] px-3.5 py-[7px] text-xs font-semibold text-white"><MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> {t('zapBotao')}</span>
                </div>
              </div>
              <div className="mx-auto mb-2 mt-1.5 h-1 w-24 rounded-full bg-[#1a1a2e]/85" />
            </div>
          </div>
          {!aberto && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[110px] bg-gradient-to-b from-transparent to-white" />}
        </div>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="relative z-10 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#dde5df] bg-white px-4 py-2 font-semibold text-[#1a5c38]"
        >
          {aberto ? t('fechar') : t('ver')}
          <ChevronDown className={`h-3.5 w-3.5 ${aberto ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>
      <p className="text-[12.5px] text-[#5a6570]">{t('exemplo')}</p>
    </div>
  )
}
