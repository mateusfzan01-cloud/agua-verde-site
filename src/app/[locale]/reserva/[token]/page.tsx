import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { MapPin } from 'lucide-react'
import { Link } from '@/i18n/config'
import { routing } from '@/i18n/routing'
import { linksDeAcompanhamento } from '@/lib/loja/acompanhar'
import { produtoPorSlug, tipoDeVeiculo } from '@/lib/loja/catalogo'
import { estadoDoPedido, gatewayDoPedido } from '@/lib/loja/fluxo'
import { formatarDataEHora, formatarMomento } from '@/lib/loja/formatos'
import { formatarReais } from '@/lib/loja/moeda'
import { avaliarCancelamento, HORA_REFERENCIA_PASSEIO } from '@/lib/loja/politicas'
import { dependencias } from '@/lib/loja/servicos'
import { AcoesDaReserva } from '@/components/loja/AcoesDaReserva'
import { AtualizaSozinho } from '@/components/loja/AtualizaSozinho'
import { MinhaReservaForm } from '@/components/loja/MinhaReservaForm'
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
  const tm = await getTranslations({ locale, namespace: 'Loja.minhaReserva' })
  const deps = dependencias()

  // Somente leitura: só consulta o gateway se ainda estiver pendente (§4.7, item 4).
  const pedido = await estadoDoPedido(deps, token)
  const produto = pedido ? produtoPorSlug(pedido.produtoSlug) : undefined

  if (!pedido || !produto) {
    return (
      <div className="mx-auto grid max-w-md gap-4 py-10 text-center">
        <p>{t('naoEncontrada')}</p>
        <Link href="/minha-reserva" className="font-semibold text-[#1a5c38] underline">{tm('titulo')}</Link>
      </div>
    )
  }

  const nome = pedido.passageiro.nome.split(' ')[0]
  const ehPasseio = pedido.tipo === 'passeio'
  const pago = pedido.status === 'pago'
  const primeiro = pedido.itens[0]
  const ehAeroporto = produto.origemPadrao.toLowerCase().includes('aeroporto')
  const reais = (v: number) => formatarReais(v, locale, true)
  const links = linksDeAcompanhamento(pedido.itens)

  const decisao =
    pago && pedido.pagoEm
      ? avaliarCancelamento({ tipo: pedido.tipo, dataIso: primeiro.dataIso, hora: primeiro.hora ?? HORA_REFERENCIA_PASSEIO, pagoEm: pedido.pagoEm, agora: new Date(), periodos: deps.periodosDeAltaTemporada })
      : null

  const titulo =
    pago ? t(ehPasseio ? 'tituloPasseio' : 'titulo', { nome }) : pedido.status === 'pendente_pagamento' ? t('tituloPendente', { nome }) : t(`estado.${pedido.status}` as 'estado.pago')
  const sub: Record<string, string> = {
    pago: ehPasseio ? t('subPasseio') : t('sub'),
    pendente_pagamento: t('pendenteMsg'),
    expirado: t('expiradoMsg'),
    reembolsado: t('reembolsadoMsg'),
    cancelado: t('reembolsadoMsg'),
  }
  const encontro = ehPasseio ? t('encontroPasseio') : ehAeroporto ? t('encontroAeroporto') : t('encontroEndereco')
  const veiculos = pedido.linhas.map((l) => `${l.quantidade}× ${l.tipo === 'pessoa' ? t('pessoas') : (tipoDeVeiculo(l.tipo)?.nome[locale] ?? l.tipo)}`).join(', ')
  const linhas: [string, string][] = [
    [ehPasseio ? produto.nome[locale] : t('kTrajeto'), ehPasseio ? '' : `${primeiro.origem} → ${primeiro.destino}`],
    ...pedido.itens.map((i): [string, string] => [
      pedido.itens.length > 1 ? (i.ordem === 1 ? t('kIda') : t('kVolta')) : t('kData'),
      i.hora === null ? `${formatarDataEHora(i.dataIso, null, locale)} · ${t('horarioCombinado')}` : formatarDataEHora(i.dataIso, i.hora, locale),
    ]),
    ...(primeiro.vooNumero ? ([[t('kVoo'), [primeiro.vooCompanhia, primeiro.vooNumero].filter(Boolean).join(' ')]] as [string, string][]) : []),
    [t('kVeiculo'), veiculos],
    ...(primeiro.endereco ? ([[t('kEndereco'), primeiro.endereco]] as [string, string][]) : []),
    [pago ? t('kPago') : t('kTotal'), reais(pedido.valorTotal)],
  ]
  const passos = ehPasseio
    ? [[t('pp1'), t('pp1d')], [t('pp2'), t('pp2d')], [t('pp3'), t('pp3d')]]
    : [[t('pt1'), t('pt1d')], [t('pt2'), t('pt2d')], [t('pt3'), t('pt3d')]]

  return (
    <div className="mx-auto grid max-w-xl gap-5">
      <AtualizaSozinho ativo={pedido.status === 'pendente_pagamento'} />

      <header className="grid gap-2">
        <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${pago ? 'bg-[#f8efd9] text-[#1a1a2e]' : cores[pedido.status]}`}>
          {pago ? t('chip') : t(`estado.${pedido.status}` as 'estado.pago')}
        </span>
        <h1 className="font-heading text-[26px] font-semibold leading-tight">{titulo}</h1>
        <p className="text-[#5a6570]">{sub[pedido.status]}</p>
        {pedido.status === 'pendente_pagamento' && (
          <Link href={`/checkout/${pedido.id}`} className="w-fit rounded-full bg-[#1a5c38] px-5 py-3 font-semibold text-white">{t('irParaPagamento')}</Link>
        )}
      </header>

      {pedido.status === 'pendente_pagamento' || pedido.status === 'expirado' ? (
        <ResumoDoPedido locale={locale} nomeProduto={produto.nome[locale]} itens={pedido.itens} linhas={pedido.linhas} total={pedido.valorTotal} />
      ) : (
        <section className="overflow-hidden rounded-[14px] border border-[#dde5df] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-dashed border-[#dde5df] p-3.5">
            <b className="font-mono tabular-nums">{pedido.numero}</b>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cores[pedido.status]}`}>{t(`estado.${pedido.status}` as 'estado.pago')}</span>
          </div>
          <dl className="grid gap-2.5 p-3.5 text-sm">
            {linhas.map(([k, v], i) => (
              <div key={`${k}-${i}`} className={v ? 'grid grid-cols-[96px_1fr] gap-3' : 'grid gap-0.5'}>
                <dt className="text-[#5a6570]">{k}</dt>
                {v && <dd className="font-semibold">{v}</dd>}
              </div>
            ))}
          </dl>
          <div className="grid gap-1 border-t border-dashed border-[#dde5df] bg-[#fafbfa] p-3.5 text-sm">
            <b>{t('encontro')}</b>
            <span className="text-[#5a6570]">{encontro}</span>
          </div>
        </section>
      )}

      {pago && decisao && (
        <>
          {links.length > 0 ? (
            <div className="grid gap-1.5">
              {links.map((l) => (
                <a
                  key={l.ordem}
                  href={l.url}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1a5c38] px-[18px] py-3.5 text-base font-semibold text-white hover:bg-[#27ae60]"
                >
                  <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
                  {links.length > 1 ? t(l.ordem === 1 ? 'acompIda' : 'acompVolta') : t('acomp')}
                </a>
              ))}
              <p className="text-center text-[12.5px] text-[#5a6570]">{t('acompD')}</p>
            </div>
          ) : (
            gatewayDoPedido(deps, pedido)?.nome === 'simulado' && (
              <div className="grid gap-1.5">
                <span aria-disabled="true" className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#1a5c38]/40 px-[18px] py-3.5 text-base font-semibold text-white">
                  <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
                  {t('acomp')}
                </span>
                <p className="text-center text-[12.5px] text-[#5a6570]">{t('acompTeste')}</p>
              </div>
            )
          )}

          <AcoesDaReserva
            token={pedido.tokenAcesso}
            numero={pedido.numero}
            ehPasseio={ehPasseio}
            cancelamento={{
              automatico: decisao.reembolsoAutomatico,
              motivo: decisao.motivo === 'servico_ja_comecou' ? 'servico_ja_comecou' : 'fora_do_prazo',
              valor: reais(pedido.valorTotal),
              gratisAte: formatarMomento(decisao.gratisAte, locale),
              arrependimento: decisao.motivo === 'arrependimento',
            }}
          />

          <section className="grid gap-3">
            <h2 className="font-heading text-xl font-semibold">{t('prox')}</h2>
            <ol className="grid gap-3">
              {passos.map(([titulo, texto], i) => (
                <li key={titulo} className="grid grid-cols-[22px_1fr] gap-3 text-sm">
                  <span className="mt-0.5 grid h-[22px] w-[22px] place-items-center rounded-full bg-[#1a5c38] text-[11px] font-bold text-white">{i === 0 ? '✓' : i + 1}</span>
                  <span><b className="block">{titulo}</b><span className="text-[#5a6570]">{texto}</span></span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <section className="grid gap-3">
        <h2 className="font-heading text-xl font-semibold">{tm('titulo')}</h2>
        <p className="text-sm text-[#5a6570]">{tm('ajuda')}</p>
        <MinhaReservaForm />
      </section>

      {gatewayDoPedido(deps, pedido)?.nome === 'simulado' && <p className="rounded-lg bg-[#f8efd9] p-3 text-sm">{t('modoTeste')}</p>}
    </div>
  )
}
