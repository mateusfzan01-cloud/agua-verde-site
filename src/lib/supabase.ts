import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type StatusViagem =
  | 'pendente'
  | 'confirmada'
  | 'a_caminho'
  | 'em_andamento'
  | 'concluida'
  | 'cancelada'
  | string

export interface Viagem {
  id: number
  passageiro_nome: string
  passageiro_telefone: string | null
  passageiro_email: string | null
  origem: string
  destino: string
  data_hora: string
  status: StatusViagem
  valor: number | null
  moeda: string | null
  numero_reserva: string | null
  token_cliente: string
  observacoes: string | null
  motorista_id: number | null
  avaliacao_nota: number | null
}
