'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { criarPedidoAction } from '@/app/[locale]/acoes'

const campo = 'w-full rounded-lg border-[1.5px] border-[#dde5df] bg-white px-3 py-2.5 text-[15px] focus:border-[#1a5c38] focus:outline-none'
const rotulo = 'grid gap-1 text-[12.5px] font-semibold text-[#5a6570]'

export function FormularioDeDados({ query, ehTransfer, ehAeroporto }: { query: string; ehTransfer: boolean; ehAeroporto: boolean }) {
  const t = useTranslations('Loja.checkout')
  const locale = useLocale()
  const [erros, setErros] = useState<string[]>([])
  const [pendente, comecar] = useTransition()

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const dados = new FormData(e.currentTarget)
    dados.set('query', query)
    dados.set('locale', locale)
    comecar(async () => {
      const r = await criarPedidoAction(dados)
      // Em caso de sucesso a ação redireciona para o pagamento; só voltamos aqui com erros.
      if (r?.erros?.length) setErros(r.erros)
    })
  }

  const temErro = (c: string) => erros.includes(c)
  const aviso = (c: string) =>
    temErro(c) ? (
      <span role="alert" className="text-xs font-semibold text-[#b42318]">
        {t(`erros.${c}` as 'erros.nome')}
      </span>
    ) : null
  const marca = (c: string) => (temErro(c) ? 'border-[#b42318]' : '')

  return (
    <form onSubmit={enviar} className="grid gap-4 rounded-2xl border border-[#dde5df] bg-white p-4 shadow-sm" noValidate>
      <h2 className="font-heading text-lg font-semibold">{t('titulo')}</h2>

      <label className={rotulo}>
        {t('nome')}
        <input name="nome" autoComplete="name" required className={`${campo} ${marca('nome')}`} />
        {aviso('nome')}
      </label>
      <label className={rotulo}>
        {t('telefone')}
        <input name="telefone" type="tel" autoComplete="tel" inputMode="tel" required className={`${campo} ${marca('telefone')}`} />
        <small className="font-normal">{t('telefoneAjuda')}</small>
        {aviso('telefone')}
      </label>
      <label className={rotulo}>
        {t('email')}
        <input name="email" type="email" autoComplete="email" required className={`${campo} ${marca('email')}`} />
        {aviso('email')}
      </label>
      <label className={rotulo}>
        {t('cpf')}
        <input name="cpf" inputMode="numeric" autoComplete="off" className={`${campo} ${marca('cpf')}`} />
        {aviso('cpf')}
      </label>
      <label className={rotulo}>
        {t('endereco')}
        <input name="endereco" autoComplete="street-address" className={campo} />
        <small className="font-normal">{t('enderecoAjuda')}</small>
      </label>
      {ehTransfer && ehAeroporto && (
        <div className="grid grid-cols-2 gap-3">
          <label className={rotulo}>
            {t('voo')}
            <input name="vooNumero" autoComplete="off" className={campo} />
          </label>
          <label className={rotulo}>
            {t('vooCompanhia')}
            <input name="vooCompanhia" autoComplete="off" className={campo} />
          </label>
        </div>
      )}
      <label className={rotulo}>
        {t('observacoes')}
        <textarea name="observacoes" rows={3} className={campo} />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="termos" className="mt-1 h-4 w-4 accent-[#1a5c38]" />
        <span>
          {t('aceite')}{' '}
          <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1a5c38] underline">
            {t('aceiteLink')}
          </a>
          {aviso('termos') && <span className="ml-2">{aviso('termos')}</span>}
        </span>
      </label>

      {erros.length > 0 && (
        <p role="alert" className="rounded-lg bg-[#fdecec] p-3 text-sm text-[#b42318]">
          {erros.includes('pedido_invalido') ? t('pedidoInvalido') : t('erroGeral')}
        </p>
      )}

      <button type="submit" disabled={pendente} className="rounded-full bg-[#1a5c38] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#27ae60] disabled:opacity-60">
        {t('continuar')}
      </button>
    </form>
  )
}
