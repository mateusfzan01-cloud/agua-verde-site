import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'
import { ehHostDeTestes } from '@/lib/loja/ambiente'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host')

  // Domínio de testes (aguaverdeviagens.com.br): fora do Google.
  if (ehHostDeTestes(host)) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/acompanhar/', '/checkout/', '/reserva/', '/minha-reserva', '/es/checkout/', '/es/reserva/', '/es/minha-reserva', '/en/checkout/', '/en/reserva/', '/en/minha-reserva'],
    },
    sitemap: 'https://aguaverde.tur.br/sitemap.xml',
  }
}
