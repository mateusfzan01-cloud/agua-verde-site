import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/config'
import type { Locale } from '@/i18n/routing'
import { precoAPartirDe } from '@/lib/loja/precos'
import type { Produto } from '@/lib/loja/tipos'
import { Preco } from './Preco'

export async function CartaoDeProduto({ produto, locale }: { produto: Produto; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'Loja.catalogo' })
  const base = produto.tipo === 'transfer' ? '/transfers' : '/passeios'
  const foto = produto.imagens[0]
  const etiqueta = produto.tipo === 'transfer' ? (produto.sentido === 'ida_volta' ? t('idaVolta') : t('ida')) : null
  return (
    <Link
      href={`${base}/${produto.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-[#dde5df] bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-[#e6f2ea]">
        {foto && (
          <Image src={foto} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition group-hover:scale-[1.02]" />
        )}
        {etiqueta && <span className="absolute left-3 top-3 rounded-full bg-[#d4a853] px-2.5 py-1 text-xs font-bold text-[#1a1a2e]">{etiqueta}</span>}
      </div>
      <div className="grid gap-1.5 p-4">
        <h3 className="font-heading text-[17px] font-semibold leading-snug">{produto.nome[locale]}</h3>
        <p className="text-[13px] text-[#5a6570]">
          {produto.origemPadrao} → {produto.destinoPadrao}
        </p>
        <p className="mt-1 text-sm text-[#5a6570]">
          {t('aPartirDe')} <Preco valor={precoAPartirDe(produto)} className="text-lg font-bold text-[#1a1a2e]" />{' '}
          {produto.modeloPreco === 'por_pessoa' ? t('porPessoa') : t('porVeiculo')}
        </p>
      </div>
    </Link>
  )
}
