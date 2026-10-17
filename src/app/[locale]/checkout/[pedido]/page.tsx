import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link, redirect } from '@/i18n/config'
import { routing } from '@/i18n/routing'
import { produtoPorSlug } from '@/lib/loja/catalogo'
import { estadoDoPedido } from '@/lib/loja/fluxo'
import { formatarMomento } from '@/lib/loja/formatos'
import { HORA_REFERENCIA_PASSEIO, prazoCancelamentoGratis } from '@/lib/loja/politicas'
import { dependencias } from '@/lib/loja/servicos'
import { PainelDePagamento } from '@/components/loja/PainelDePagamento'
import { Promessas } from '@/components/loja/Promessas'
import { ResumoDoPedido } from '@/components/loja/ResumoDoPedido'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function Pagamento({ params }: { params: Promise<{ locale: string; pedido: string }> }) {
  const { locale, pedido: pedidoId } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.pagamento' })
  const tc = await getTranslations({ locale, namespace: 'Loja.checkout' })
  const deps = dependencias()

  const encontrado = await deps.repo.buscarPorId(pedidoId)
  // Lê o estado atual (pergunta ao gateway se ainda estiver pendente) antes de decidir o que mostrar.
  const pedido = encontrado ? await estadoDoPedido(deps, encontrado.tokenAcesso) : null
  const produto = pedido ? produtoPorSlug(pedido.produtoSlug) : undefined

  if (!pedido || !produto) {
    return (
      <div className="mx-auto grid max-w-md gap-4 py-10 text-center">
        <p>{t('naoEncontrado')}</p>
        <Link href="/transfers" className="font-semibold text-[#1a5c38] underline">{t('ver')}</Link>
      </div>
    )
  }
  if (pedido.status === 'pago') redirect({ href: `/reserva/${pedido.tokenAcesso}`, locale })

  const gratisAte = prazoCancelamentoGratis(pedido.tipo, pedido.itens[0].dataIso, pedido.itens[0].hora ?? HORA_REFERENCIA_PASSEIO)

  return (
    <div className="mx-auto grid max-w-xl gap-4 lg:max-w-4xl lg:grid-cols-[1fr_360px] lg:items-start lg:gap-6">
      <div className="grid gap-3">
        <p className="text-sm text-[#5a6570]">{t('pedido')} {pedido.numero}</p>
        <PainelDePagamento
          pedidoId={pedido.id}
          meio={pedido.meio ?? null}
          pix={pedido.pix ?? null}
          urlDePagamento={pedido.urlDePagamento ?? null}
          simulacao={deps.gateway.nome === 'simulado' && process.env.LOJA_PERMITE_SIMULACAO !== 'false'}
          expirado={pedido.status === 'expirado'}
        />
      </div>
      <div className="grid gap-3 lg:sticky lg:top-24">
        <ResumoDoPedido
          locale={locale}
          nomeProduto={produto.nome[locale]}
          itens={pedido.itens}
          linhas={pedido.linhas}
          total={pedido.valorTotal}
          rodape={<p className="text-[12.5px] text-[#5a6570]">{tc('cobrado')} {tc('cancelGratis')} {formatarMomento(gratisAte, locale)}.</p>}
        />
        <Promessas locale={locale} compacta />
      </div>
    </div>
  )
}
