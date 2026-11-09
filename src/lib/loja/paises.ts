/** Países do seletor de WhatsApp: código ISO (para a bandeira e o nome) e código de discagem. */
export interface Pais {
  iso: string
  dial: string
}

/** Os mais prováveis primeiro (vizinhos e origens de turistas de Pernambuco), depois os demais. */
export const PAISES: Pais[] = [
  { iso: 'BR', dial: '55' }, { iso: 'AR', dial: '54' }, { iso: 'US', dial: '1' }, { iso: 'PT', dial: '351' },
  { iso: 'ES', dial: '34' }, { iso: 'CL', dial: '56' }, { iso: 'UY', dial: '598' }, { iso: 'PY', dial: '595' },
  { iso: 'CO', dial: '57' }, { iso: 'MX', dial: '52' }, { iso: 'PE', dial: '51' }, { iso: 'BO', dial: '591' },
  { iso: 'EC', dial: '593' }, { iso: 'VE', dial: '58' }, { iso: 'CA', dial: '1' }, { iso: 'GB', dial: '44' },
  { iso: 'DE', dial: '49' }, { iso: 'FR', dial: '33' }, { iso: 'IT', dial: '39' }, { iso: 'NL', dial: '31' },
  { iso: 'CH', dial: '41' }, { iso: 'BE', dial: '32' }, { iso: 'AT', dial: '43' }, { iso: 'IE', dial: '353' },
  { iso: 'SE', dial: '46' }, { iso: 'NO', dial: '47' }, { iso: 'DK', dial: '45' }, { iso: 'FI', dial: '358' },
  { iso: 'PL', dial: '48' }, { iso: 'CZ', dial: '420' }, { iso: 'RO', dial: '40' }, { iso: 'HU', dial: '36' },
  { iso: 'GR', dial: '30' }, { iso: 'TR', dial: '90' }, { iso: 'IL', dial: '972' }, { iso: 'AE', dial: '971' },
  { iso: 'ZA', dial: '27' }, { iso: 'AO', dial: '244' }, { iso: 'AU', dial: '61' }, { iso: 'NZ', dial: '64' },
  { iso: 'JP', dial: '81' }, { iso: 'CN', dial: '86' }, { iso: 'IN', dial: '91' }, { iso: 'KR', dial: '82' },
]

/** País que já vem marcado, conforme o idioma da página. */
export function paisPadraoDoIdioma(idioma: 'pt' | 'es' | 'en'): string {
  return idioma === 'pt' ? 'BR' : idioma === 'es' ? 'AR' : 'US'
}

export function paisPorIso(iso: string): Pais {
  return PAISES.find((p) => p.iso === iso) ?? PAISES[0]
}

/** Número completo em formato internacional (+5581999473200) a partir do país e do que a pessoa digitou. */
export function montarTelefone(iso: string, digitado: string): string {
  const t = digitado.trim()
  // Quem cola o número já com "+" não precisa do seletor.
  if (t.startsWith('+')) return `+${t.replace(/\D/g, '')}`
  const digitos = t.replace(/\D/g, '')
  if (!digitos) return ''
  const { dial } = paisPorIso(iso)
  // Brasil: aceita o "0" na frente do DDD.
  const semZero = dial === '55' ? digitos.replace(/^0+/, '') : digitos
  return `+${dial}${semZero}`
}
