import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/acompanhar/'],
    },
    sitemap: 'https://aguaverde.tur.br/sitemap.xml',
  }
}
