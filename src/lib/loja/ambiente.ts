/**
 * Quando a loja aparece e quando o site deve ficar fora do Google.
 *
 * - O domínio oficial (aguaverde.tur.br) só mostra a loja depois que
 *   LOJA_HABILITADA=true for definido na Vercel (lançamento).
 * - O domínio de testes (aguaverdeviagens.com.br) e as prévias da Vercel
 *   mostram a loja sempre, mas ficam fora do Google (decisão 35).
 */

const HOSTS_DE_TESTE_PADRAO = ['aguaverdeviagens.com.br', 'www.aguaverdeviagens.com.br']

function semPorta(host: string | null | undefined): string {
  return (host ?? '').toLowerCase().replace(/:\d+$/, '')
}

export function hostsDeTeste(): string[] {
  const env = process.env.HOSTS_NOINDEX
  if (!env) return HOSTS_DE_TESTE_PADRAO
  return env.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean)
}

export function ehHostDeTestes(host: string | null | undefined): boolean {
  return hostsDeTeste().includes(semPorta(host))
}

export function lojaHabilitadaParaHost(host: string | null | undefined): boolean {
  if (process.env.LOJA_HABILITADA === 'true') return true
  if (ehHostDeTestes(host)) return true
  if (process.env.LOJA_HABILITADA === 'false') return false
  // Prévias da Vercel e desenvolvimento local mostram a loja; produção não.
  return process.env.VERCEL_ENV !== 'production'
}
