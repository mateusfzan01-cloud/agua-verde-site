import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/config'
import { routing } from '@/i18n/routing'
import { lerQuery } from '@/lib/loja/checkout-url'
import { produtoPorSlug } from '@/lib/loja/catalogo'
import { validarAgenda } from '@/lib/loja/datas'
import { formatarMomento } from '@/lib/loja/formatos'
import { montarItens } from '@/lib/loja/itens'
import { HORA_REFERENCIA_PASSEIO, prazoCancelamentoGratis } from '@/lib/loja/politicas'
import { calcularPreco } from '@/lib/loja/precos'
import { FormularioDeDados } from '@/components/loja/FormularioDeDados'
import { ResumoDoPedido } from '@/components/loja/ResumoDoPedido'

export const metadata: Metadata = { robots: { index: false, follow: false } }

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Checkout({ params, searchParams }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.checkout' })

  const sp = await searchParams
  const query = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v] as [string, string]] : [])))
  const escolha = lerQuery(query)
  const produto = escolha ? produtoPorSlug(escolha.slug) : undefined
  const preco = produto && escolha ? calcularPreco(produto, escolha.selecao) : null
  const agendaComErro =
    produto && escolha
      ? validarAgenda({ tipo: produto.tipo, sentido: produto.sentido, data: escolha.data, hora: escolha.hora, dataVolta: escolha.dataVolta, horaVolta: escolha.horaVolta }, new Date())
      : []

  if (!escolha || !produto || !preco || !preco.ok || agendaComErro.length > 0) {
    return (
      <div className="mx-auto grid max-w-md gap-4 py-10 text-center">
        <p>{t('pedidoInvalido')}</p>
        <Link href="/transfers" className="font-semibold text-[#1a5c38] underline">{t('voltar')}</Link>
      </div>
    )
  }

  const itens = montarItens(produto, { data: escolha.data, hora: escolha.hora, dataVolta: escolha.dataVolta, horaVolta: escolha.horaVolta })
  const gratisAte = prazoCancelamentoGratis(produto.tipo, itens[0].dataIso, itens[0].hora ?? HORA_REFERENCIA_PASSEIO)
  const ehAeroporto = produto.origemPadrao.toLowerCase().includes('aeroporto')

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="order-2 lg:order-1">
        <FormularioDeDados query={query.toString()} ehTransfer={produto.tipo === 'transfer'} ehAeroporto={ehAeroporto} />
      </div>
      <div className="order-1 lg:sticky lg:top-24 lg:order-2">
        <ResumoDoPedido
          locale={locale}
          nomeProduto={produto.nome[locale]}
          itens={itens}
          linhas={preco.linhas}
          total={preco.total}
          rodape={
            <p className="text-[12.5px] text-[#5a6570]">
              {t('cobrado')} {t('cancelGratis')} {formatarMomento(gratisAte, locale)}.
            </p>
          }
        />
      </div>
    </div>
  )
}
