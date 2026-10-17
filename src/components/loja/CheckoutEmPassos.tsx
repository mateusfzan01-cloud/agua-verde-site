'use client'

import { useCallback, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { finalizarCompraAction } from '@/app/[locale]/acoes'
import type { Locale } from '@/i18n/routing'
import { validarPassageiro } from '@/lib/loja/contato'
import { formatarReais } from '@/lib/loja/moeda'
import { TelefoneComPais } from './TelefoneComPais'

const campo = 'w-full rounded-[10px] border-[1.5px] bg-white px-3 py-2.5 text-[15px] min-h-[46px] focus:border-[#1a5c38] focus:outline-none'
const rotulo = 'grid gap-1 text-[12.5px] font-semibold text-[#5a6570]'
const botaoPri = 'flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5c38] px-[18px] py-3.5 text-base font-semibold text-white hover:bg-[#27ae60] disabled:opacity-60'
const botaoSec = 'flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#dde5df] bg-white px-[18px] py-3.5 text-base font-semibold text-[#1a5c38]'

type Passo = 1 | 2 | 3

/**
 * Checkout em 3 passos na mesma tela, como no protótipo: 1. Seus dados, 2. Voo e hotel (ou só hotel), 3. Pagamento.
 * No último passo cria o pedido, abre a cobrança e leva para a tela do Pix.
 */
export function CheckoutEmPassos({
  query,
  ehTransfer,
  ehAeroporto,
  horasCancelamento,
  total,
}: {
  query: string
  ehTransfer: boolean
  ehAeroporto: boolean
  horasCancelamento: number
  total: number
}) {
  const t = useTranslations('Loja.checkout')
  const locale = useLocale() as Locale
  const [passo, setPasso] = useState<Passo>(1)
  const [d, setD] = useState({ nome: '', telefone: '', email: '', cpf: '', endereco: '', vooNumero: '', vooCompanhia: '', observacoes: '' })
  const [meio, setMeio] = useState<'pix' | 'cartao'>('pix')
  const [aceitou, setAceitou] = useState(false)
  const [erros, setErros] = useState<string[]>([])
  const [erroAceite, setErroAceite] = useState(false)
  const [pendente, comecar] = useTransition()

  const mostraVoo = ehTransfer && ehAeroporto
  // Ao corrigir um campo, o aviso vermelho dele some.
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setD((x) => ({ ...x, [k]: e.target.value }))
    setErros((lista) => lista.filter((c) => c !== k))
  }
  const setTelefone = useCallback((telefone: string) => {
    setD((x) => (x.telefone === telefone ? x : { ...x, telefone }))
    setErros((lista) => (lista.includes('telefone') ? lista.filter((c) => c !== 'telefone') : lista))
  }, [])

  function avancaDoPasso1() {
    const r = validarPassageiro({ nome: d.nome, telefone: d.telefone, email: d.email, cpf: d.cpf, aceitouTermos: true })
    const lista = r.ok ? [] : r.erros
    setErros(lista)
    if (lista.length === 0) setPasso(2)
  }

  function pagar() {
    if (!aceitou) return setErroAceite(true)
    setErroAceite(false)
    const f = new FormData()
    f.set('query', query)
    f.set('locale', locale)
    f.set('meio', meio)
    f.set('termos', 'on')
    for (const [k, v] of Object.entries(d)) f.set(k, v)
    comecar(async () => {
      const r = await finalizarCompraAction(f)
      // Em caso de sucesso a ação redireciona para o pagamento; só voltamos aqui com erros.
      if (r?.erros?.length) {
        setErros(r.erros)
        if (r.erros.some((e) => ['nome', 'telefone', 'email', 'cpf'].includes(e))) setPasso(1)
      }
    })
  }

  const erro = (c: string) => (erros.includes(c) ? t(`erros.${c}` as 'erros.nome') : null)
  const borda = (c: string) => (erros.includes(c) ? 'border-[#b42318]' : 'border-[#dde5df]')
  const valor = formatarReais(total, locale, true)

  const rotulosDosPassos = [t('s1'), ehTransfer ? t('s2t') : t('s2p'), t('s3')]

  return (
    <div className="grid gap-4">
      <ol className="grid grid-cols-3 gap-1.5 text-center text-xs font-semibold" aria-label="passos">
        {rotulosDosPassos.map((r, i) => (
          <li key={r} aria-current={passo === i + 1 ? 'step' : undefined} className={`rounded-full px-2 py-1.5 ${passo >= i + 1 ? 'bg-[#e6f2ea] text-[#1a5c38]' : 'bg-white text-[#5a6570] ring-1 ring-[#dde5df]'}`}>
            {r}
          </li>
        ))}
      </ol>

      <form onSubmit={(e) => e.preventDefault()} noValidate className="rounded-[14px] border border-[#dde5df] bg-white p-3.5 shadow-sm">
        <div hidden={passo !== 1} className="grid gap-3.5">
          <h2 className="font-heading text-xl font-semibold">{t('h1')}</h2>
          <label className={rotulo}>
            {t('nome')}
            <input value={d.nome} onChange={set('nome')} autoComplete="name" className={`${campo} ${borda('nome')}`} />
            {erro('nome') && <span role="alert" className="text-xs font-semibold text-[#b42318]">{erro('nome')}</span>}
          </label>
          <TelefoneComPais name="telefone" label={t('wa')} ajuda={t('waAjuda')} erro={erro('telefone')} onChange={setTelefone} />
          <label className={rotulo}>
            {t('email')}
            <input type="email" value={d.email} onChange={set('email')} autoComplete="email" className={`${campo} ${borda('email')}`} />
            {erro('email') && <span role="alert" className="text-xs font-semibold text-[#b42318]">{erro('email')}</span>}
          </label>
          <label className={rotulo}>
            {t('cpf')}
            <input value={d.cpf} onChange={set('cpf')} inputMode="numeric" placeholder="000.000.000-00" autoComplete="off" className={`${campo} ${borda('cpf')}`} />
            <small className="font-normal">{t('cpfAjuda')}</small>
            {erro('cpf') && <span role="alert" className="text-xs font-semibold text-[#b42318]">{erro('cpf')}</span>}
          </label>
          <button type="button" onClick={avancaDoPasso1} className={botaoPri}>{t('cont')}</button>
        </div>

        <div hidden={passo !== 2} className="grid gap-3.5">
          <h2 className="font-heading text-xl font-semibold">{ehTransfer ? t('h2t') : t('h2p')}</h2>
          {mostraVoo && (
            <div className="grid grid-cols-2 gap-2.5">
              <label className={rotulo}>
                {t('voo')}
                <input value={d.vooNumero} onChange={set('vooNumero')} autoComplete="off" className={`${campo} border-[#dde5df]`} />
              </label>
              <label className={rotulo}>
                {t('cia')}
                <input value={d.vooCompanhia} onChange={set('vooCompanhia')} autoComplete="off" className={`${campo} border-[#dde5df]`} />
              </label>
            </div>
          )}
          <label className={rotulo}>
            {ehTransfer && ehAeroporto ? t('hotelt') : t('hotelp')}
            <input value={d.endereco} onChange={set('endereco')} autoComplete="street-address" className={`${campo} border-[#dde5df]`} />
          </label>
          <label className={rotulo}>
            {t('obs')}
            <textarea value={d.observacoes} onChange={set('observacoes')} rows={3} placeholder={t('obsPh')} className={`${campo} min-h-[70px] border-[#dde5df]`} />
          </label>
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <button type="button" onClick={() => setPasso(1)} className={botaoSec}>{t('volt')}</button>
            <button type="button" onClick={() => setPasso(3)} className={botaoPri}>{t('cont')}</button>
          </div>
        </div>

        <div hidden={passo !== 3} className="grid gap-3.5">
          <h2 className="font-heading text-xl font-semibold">{t('h3')}</h2>
          <div role="radiogroup" className="grid gap-2">
            {(['pix', 'cartao'] as const).map((m) => (
              <label key={m} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border-[1.5px] p-3 ${meio === m ? 'border-[#1a5c38] bg-[#e6f2ea]' : 'border-[#dde5df]'}`}>
                <input type="radio" name="pg" value={m} checked={meio === m} onChange={() => setMeio(m)} className="mt-1 h-[18px] w-[18px] accent-[#1a5c38]" />
                <span className="grid gap-0.5">
                  <b>{m === 'pix' ? t('pix') : t('cartao')}</b>
                  <small className="text-[12.5px] text-[#5a6570]">{m === 'pix' ? t('pixAjuda') : t('cartaoAjuda')}</small>
                </span>
              </label>
            ))}
          </div>
          <p className="text-[12.5px] text-[#5a6570]">{t('mp')}</p>
          <label className="flex items-start gap-2.5 text-[13px]">
            <input type="checkbox" checked={aceitou} onChange={(e) => setAceitou(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#1a5c38]" />
            <span>
              {t('aceiteA')}{' '}
              <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1a5c38] underline">{t('termos')}</a>
              {t('aceiteB', { horas: horasCancelamento })}{' '}
              <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1a5c38] underline">{t('privacidade')}</a>.
            </span>
          </label>
          {(erroAceite || erros.includes('termos')) && <p role="alert" className="rounded-lg bg-[#fdecec] p-3 text-sm text-[#b42318]">{t('erroAceite')}</p>}
          {erros.length > 0 && !erroAceite && (
            <p role="alert" className="rounded-lg bg-[#fdecec] p-3 text-sm text-[#b42318]">{erros.includes('pedido_invalido') ? t('pedidoInvalido') : t('erroGeral')}</p>
          )}
          <button type="button" disabled={pendente} onClick={pagar} className={botaoPri}>
            {pendente ? t('processando') : `${meio === 'pix' ? t('pagarPix') : t('pagarCartao')}${valor}`}
          </button>
          <button type="button" onClick={() => setPasso(2)} className={botaoSec}>{t('volt')}</button>
        </div>
      </form>
    </div>
  )
}
