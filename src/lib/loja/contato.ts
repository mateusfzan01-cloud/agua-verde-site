/** Validação dos dados do passageiro no checkout (sem passageiros nem malas: decisão do dono). */

export interface DadosDoPassageiro {
  nome: string
  telefone: string
  email: string
  cpf?: string
  /** Hotel ou endereço de embarque/desembarque. */
  endereco?: string
  vooNumero?: string
  vooCompanhia?: string
  observacoes?: string
  aceitouTermos: boolean
}

export type CampoComErro = 'nome' | 'telefone' | 'email' | 'cpf' | 'termos'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Mantém só dígitos e devolve em formato internacional (E.164). Sem "+", assume Brasil. */
export function normalizarTelefone(entrada: string): string | null {
  const t = entrada.trim()
  const internacional = t.startsWith('+')
  const digitos = t.replace(/\D/g, '')
  if (internacional) return digitos.length >= 10 && digitos.length <= 15 ? `+${digitos}` : null
  // Brasil: DDD + 8 ou 9 dígitos, com ou sem 55 na frente.
  const sem55 = digitos.startsWith('55') && digitos.length >= 12 ? digitos.slice(2) : digitos
  return sem55.length === 10 || sem55.length === 11 ? `+55${sem55}` : null
}

export function cpfValido(entrada: string): boolean {
  const d = entrada.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const digito = (n: number) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10])
}

export function validarPassageiro(d: DadosDoPassageiro): { ok: true; telefoneE164: string } | { ok: false; erros: CampoComErro[] } {
  const erros: CampoComErro[] = []
  if (d.nome.trim().split(/\s+/).filter(Boolean).length < 2) erros.push('nome')
  const telefone = normalizarTelefone(d.telefone)
  if (!telefone) erros.push('telefone')
  if (!EMAIL.test(d.email.trim())) erros.push('email')
  if (d.cpf && d.cpf.trim() !== '' && !cpfValido(d.cpf)) erros.push('cpf')
  if (!d.aceitouTermos) erros.push('termos')
  return erros.length === 0 && telefone ? { ok: true, telefoneE164: telefone } : { ok: false, erros }
}
