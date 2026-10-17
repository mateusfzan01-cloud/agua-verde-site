import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { produtosPorTipo } from '@/lib/loja/catalogo'
import type { TipoProduto } from '@/lib/loja/tipos'
import { CartaoDeProduto } from './CartaoDeProduto'
import { Promessas } from './Promessas'

export async function PaginaDeCatalogo({ locale, tipo }: { locale: Locale; tipo: TipoProduto }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Loja.catalogo' })
  const produtos = produtosPorTipo(tipo)
  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <h1 className="font-heading text-3xl font-semibold">{tipo === 'transfer' ? t('transfersTitulo') : t('passeiosTitulo')}</h1>
        <p className="text-[#5a6570]">{tipo === 'transfer' ? t('transfersSub') : t('passeiosSub')}</p>
      </header>
      <Promessas locale={locale} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {produtos.map((p) => (
          <CartaoDeProduto key={p.slug} produto={p} locale={locale} />
        ))}
      </div>
      <p className="text-center text-[#5a6570]">
        {t('orcamento')}{' '}
        <a href="https://wa.me/5581999473200" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1a5c38] underline">
          {t('orcamentoLink')}
        </a>
      </p>
    </div>
  )
}
