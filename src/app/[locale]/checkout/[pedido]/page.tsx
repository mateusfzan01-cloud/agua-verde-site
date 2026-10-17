import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link, redirect } from '@/i18n/config'
import { routing } from '@/i18n/routing'
import { produtoPorSlug } from '@/lib/loja/catalogo'
import { estadoDoPedido } from '@/lib/loja/fluxo'
import { dependencias } from '@/lib/loja/servicos'
import { AtualizaSozinho } from '@/components/loja/AtualizaSozinho'
import { PainelDePagamento } from '@/components/loja/PainelDePagamento'
import { ResumoDoPedido } from '@/components/loja/ResumoDoPedido'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function Pagamento({ params }: { params: Promise<{ locale: string; pedido: string }> }) {
  const { locale, pedido: pedidoId } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.pagamento' })
  const deps = dependencias()

  const encontrado = await deps.repo.buscarPorId(pedidoId)
  // Lê o estado atual (pergunta ao gateway se ainda estiver pendente) antes de decidir o que mostrar.
  const pedido = encontrado ? await estadoDoPedido(deps, encontrado.tokenAcesso) : null
  const produto = pedido ? produtoPorSlug(pedido.produtoSlug) : undefined

  if (!pedido || !produto) {
    return (
      <div className="mx-auto grid max-w-md gap-4 py-10 text-center">
        <p>{t('naoEncontrado')}</p>
        <Link href="/transfers" className="font-semibold text-[#1a5c38] underline">{t('verReserva')}</Link>
      </div>
    )
  }
  if (pedido.status === 'pago') redirect({ href: `/reserva/${pedido.tokenAcesso}`, locale })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="order-2 grid gap-4 lg:order-1">
        <h1 className="font-heading text-2xl font-semibold">{t('titulo')}</h1>
        <p className="text-sm text-[#5a6570]">{t('pedido')} {pedido.numero}</p>
        <PainelDePagamento pedidoId={pedido.id} expirado={pedido.status === 'expirado'} />
        <AtualizaSozinho ativo={pedido.status === 'pendente_pagamento'} cadaMs={8000} />
      </div>
      <div className="order-1 lg:sticky lg:top-24 lg:order-2">
        <ResumoDoPedido locale={locale} nomeProduto={produto.nome[locale]} itens={pedido.itens} linhas={pedido.linhas} total={pedido.valorTotal} />
      </div>
    </div>
  )
}
