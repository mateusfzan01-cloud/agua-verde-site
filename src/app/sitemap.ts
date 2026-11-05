import { MetadataRoute } from 'next'
import { produtosAtivos } from '@/lib/loja/catalogo'
import { caminhoLocalizado } from '@/lib/loja/formatos'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aguaverde.tur.br'

  // A loja só entra no sitemap depois do lançamento (LOJA_HABILITADA=true na Vercel).
  const loja: MetadataRoute.Sitemap = process.env.LOJA_HABILITADA === 'true' ? lojaNoSitemap(baseUrl) : []

  return [
    ...loja,
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/quem-somos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/transfer-porto-de-galinhas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/transfer-praia-de-carneiros`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/transfer-maragogi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/termos-de-uso`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}

/** Catálogo e produtos nos 3 idiomas, com os endereços alternativos (hreflang). */
function lojaNoSitemap(baseUrl: string): MetadataRoute.Sitemap {
  const caminhos = [
    '/transfers',
    '/passeios',
    ...produtosAtivos().map((p) => `/${p.tipo === 'transfer' ? 'transfers' : 'passeios'}/${p.slug}`),
  ]
  return caminhos.flatMap((caminho) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}${caminhoLocalizado(locale, caminho)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: caminho.split('/').length > 2 ? 0.8 : 0.9,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${baseUrl}${caminhoLocalizado(l, caminho)}`])),
      },
    })),
  )
}
