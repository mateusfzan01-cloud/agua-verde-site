import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { MessageCircle } from 'lucide-react'
import { Link } from '@/i18n/config'
import { routing } from '@/i18n/routing'
import { produtoPorSlug } from '@/lib/loja/catalogo'
import { estadoDoPedido } from '@/lib/loja/fluxo'
import { formatarMomento } from '@/lib/loja/formatos'
import { avaliarCancelamento, HORA_REFERENCIA_PASSEIO } from '@/lib/loja/politicas'
import { dependencias } from '@/lib/loja/servicos'
import { AtualizaSozinho } from '@/components/loja/AtualizaSozinho'
import { CancelarReserva } from '@/components/loja/CancelarReserva'
import { ResumoDoPedido } from '@/components/loja/ResumoDoPedido'

export const metadata: Metadata = { robots: { index: false, follow: false } }

const cores: Record<string, string> = {
  pago: 'bg-[#e6f2ea] text-[#1a5c38]',
  pendente_pagamento: 'bg-[#f8efd9] text-[#8a6410]',
  reembolsado: 'bg-[#eef0f2] text-[#5a6570]',
  cancelado: 'bg-[#eef0f2] text-[#5a6570]',
  expirado: 'bg-[#eef0f2] text-[#5a6570]',
}

export default async function Reserva({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.reserva' })
  const deps = dependencias()

  // Somente leitura: só consulta o gateway se ainda estiver pendente (§4.7, item 4).
  const pedido = await estadoDoPedido(deps, token)
  const produto = pedido ? produtoPorSlug(pedido.produtoSlug) : undefined

  if (!pedido || !produto) {
    return (
      <div className="mx-auto grid max-w-md gap-4 py-10 text-center">
        <p>{t('naoEncontrada')}</p>
        <Link href="/minha-reserva" className="font-semibold text-[#1a5c38] underline">{t('titulo')}</Link>
      </div>
    )
  }

  const decisao =
    pedido.status === 'pago' && pedido.pagoEm
      ? avaliarCancelamento({
          tipo: pedido.tipo,
          dataIso: pedido.itens[0].dataIso,
          hora: pedido.itens[0].hora ?? HORA_REFERENCIA_PASSEIO,
          pagoEm: pedido.pagoEm,
          agora: new Date(),
          periodos: deps.periodosDeAltaTemporada,
        })
      : null

  const ehPasseio = pedido.tipo === 'passeio'
  const mensagem: Record<string, string> = {
    pago: ehPasseio ? t('vagaGarantida') : t('transferConfirmado'),
    pendente_pagamento: t('pendenteMsg'),
    expirado: t('expiradoMsg'),
    reembolsado: t('reembolsadoMsg'),
    cancelado: t('reembolsadoMsg'),
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <AtualizaSozinho ativo={pedido.status === 'pendente_pagamento'} />
      <header className="grid gap-2">
        <h1 className="font-heading text-2xl font-semibold">{t('titulo')}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${cores[pedido.status]}`}>{t(`estado.${pedido.status}` as 'estado.pago')}</span>
          <span className="text-sm text-[#5a6570]">
            {t('numero')}: <b className="font-mono text-[#1a1a2e]">{pedido.numero}</b>
          </span>
        </div>
        <p>{mensagem[pedido.status]}</p>
        {pedido.status === 'pendente_pagamento' && (
          <Link href={`/checkout/${pedido.id}`} className="w-fit rounded-full bg-[#1a5c38] px-5 py-3 font-semibold text-white">{t('irParaPagamento')}</Link>
        )}
      </header>

      <ResumoDoPedido locale={locale} nomeProduto={produto.nome[locale]} itens={pedido.itens} linhas={pedido.linhas} total={pedido.valorTotal} />

      <section className="grid gap-1 rounded-2xl border border-[#dde5df] bg-white p-4 text-sm shadow-sm">
        <b>{t('passageiro')}</b>
        <span>{pedido.passageiro.nome}</span>
        <span className="text-[#5a6570]">{pedido.passageiro.telefone} · {pedido.passageiro.email}</span>
      </section>

      {decisao && (
        <CancelarReserva
          token={pedido.tokenAcesso}
          gratisAte={formatarMomento(decisao.gratisAte, locale)}
          arrependimento={decisao.motivo === 'arrependimento'}
        />
      )}

      <a
        href="https://wa.me/5581999473200"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-fit items-center gap-2 rounded-full bg-[#25d366] px-5 py-3 font-semibold text-white"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('falar')}
      </a>
      {deps.gateway.nome === 'simulado' && <p className="rounded-lg bg-[#f8efd9] p-3 text-sm">{t('modoTeste')}</p>}
    </div>
  )
}
