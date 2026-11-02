import { MetadataRoute } from 'next'

// Lista explícita para que a permissão fique clara por nome (alguns robôs tratam o `*` de forma conservadora).
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot', 'Applebot-Extended',
  'Bingbot', 'CCBot', 'Amazonbot', 'meta-externalagent', 'DuckAssistBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/acompanhar/'] },
      { userAgent: AI_BOTS, allow: '/', disallow: ['/acompanhar/'] },
    ],
    sitemap: 'https://aguaverde.tur.br/sitemap.xml',
  }
}
