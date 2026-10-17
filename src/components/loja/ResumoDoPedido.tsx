import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { tipoDeVeiculo } from '@/lib/loja/catalogo'
import { formatarDataEHora } from '@/lib/loja/formatos'
import type { LinhaDePreco } from '@/lib/loja/precos'
import type { ItemDoPedido } from '@/lib/loja/pedidos-tipos'
import { Preco } from './Preco'

/**
 * Resumo da compra: produto, quando, veículos (ou pessoas) e total.
 * O trecho (origem → destino) não se repete aqui: já está no nome do produto.
 * Se só há uma linha de veículos, o valor aparece uma vez só, no total.
 */
export async function ResumoDoPedido({
  locale,
  nomeProduto,
  itens,
  linhas,
  total,
  rodape,
}: {
  locale: Locale
  nomeProduto: string
  itens: ItemDoPedido[]
  linhas: LinhaDePreco[]
  total: number
  rodape?: React.ReactNode
}) {
  const t = await getTranslations({ locale, namespace: 'Loja.checkout' })
  const tr = await getTranslations({ locale, namespace: 'Loja.reserva' })
  const tp = await getTranslations({ locale, namespace: 'Loja.produto' })
  const nomeDaLinha = (l: LinhaDePreco) => (l.tipo === 'pessoa' ? tr('pessoas') : (tipoDeVeiculo(l.tipo)?.nome[locale] ?? l.tipo))
  const umaLinha = linhas.length === 1

  return (
    <section className="grid gap-3 rounded-[14px] border border-[#dde5df] bg-white p-3.5 shadow-sm">
      <h2 className="font-heading text-lg font-semibold">{t('resumo')}</h2>
      <p className="font-semibold leading-snug">{nomeProduto}</p>

      <div className="grid gap-2.5 border-t border-[#dde5df] pt-3">
        {itens.map((item) => (
          <div key={item.ordem} className="grid gap-0.5 text-sm">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-[#5a6570]">
              {itens.length > 1 ? (item.ordem === 1 ? t('ida') : t('volta')) : t('quando')}
            </span>
            <b>{formatarDataEHora(item.dataIso, item.hora, locale)}</b>
            {item.hora === null && <span className="text-[12.5px] text-[#5a6570]">{tp('horarioCombinado')}</span>}
          </div>
        ))}
      </div>

      <ul className="grid gap-1.5 border-t border-[#dde5df] pt-3 text-sm">
        {linhas.map((l) => (
          <li key={l.tipo} className="flex justify-between gap-3">
            <span>
              {l.quantidade}× {nomeDaLinha(l)}
              {umaLinha && l.quantidade > 1 && (
                <span className="text-[#5a6570]">
                  {' '}
                  (<Preco valor={l.precoUnitario} centavos semAprox aproxClassName="" /> {t('unidade')})
                </span>
              )}
            </span>
            {!umaLinha && <Preco valor={l.subtotal} centavos semAprox />}
          </li>
        ))}
      </ul>

      <div className="flex items-end justify-between gap-3 border-t border-[#dde5df] pt-3">
        <span className="font-semibold">{t('total')}</span>
        <Preco valor={total} centavos className="text-2xl font-bold" aproxClassName="ml-2 text-sm font-normal text-[#5a6570]" />
      </div>
      {rodape}
    </section>
  )
}
