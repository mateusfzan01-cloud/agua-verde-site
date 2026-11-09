import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'
import { ehHostDeTestes } from '@/lib/loja/ambiente'

// Lista explícita para que a permissão fique clara por nome (alguns robôs tratam o `*` de forma conservadora).
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot', 'Applebot-Extended',
  'Bingbot', 'CCBot', 'Amazonbot', 'meta-externalagent', 'DuckAssistBot',
]

// Páginas privadas: rastreamento de viagem e etapas da compra.
const DISALLOW = [
  '/acompanhar/',
  '/checkout/', '/reserva/', '/minha-reserva',
  '/es/checkout/', '/es/reserva/', '/es/minha-reserva',
  '/en/checkout/', '/en/reserva/', '/en/minha-reserva',
]

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host')

  // Domínio de testes (aguaverdeviagens.com.br): fora do Google.
  if (ehHostDeTestes(host)) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_BOTS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: 'https://aguaverde.tur.br/sitemap.xml',
  }
}
