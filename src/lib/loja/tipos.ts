export type Idioma = 'pt' | 'es' | 'en'
export type Textos = Record<Idioma, string>
export type ListasDeTexto = Record<Idioma, string[]>

export type TipoProduto = 'transfer' | 'passeio'
export type ModeloPreco = 'por_veiculo' | 'por_pessoa'
export type Sentido = 'ida' | 'volta' | 'ida_volta' | 'n/a'

/** Um veículo oferecido num produto, com o preço daquele produto. */
export interface VeiculoDoProduto {
  tipo: string
  preco: number
}

/** Dados do tipo de veículo, iguais em todos os produtos. */
export interface TipoDeVeiculo {
  chave: string
  nome: Textos
  capacidade: Textos
  paxMax: number
}

export interface Produto {
  ordem: number
  slug: string
  slugPaytour: string
  tipo: TipoProduto
  nome: Textos
  descricao: Textos
  inclusos: ListasDeTexto
  naoInclusos: ListasDeTexto
  origemPadrao: string
  destinoPadrao: string
  sentido: Sentido
  modeloPreco: ModeloPreco
  /** Só nos produtos por pessoa (mergulho, catamarã de Noronha, Trilha dos Escravos). */
  precoPorPessoa: number | null
  veiculos: VeiculoDoProduto[]
  maxPorCompra: number
  duracaoMin: number | null
  imagens: string[]
  ativo: boolean
  seo: { titulo: Textos; descricao: Textos }
}

/** O que o cliente escolheu: quantos de cada veículo, ou quantas pessoas. */
export interface Selecao {
  veiculos?: Record<string, number>
  pessoas?: number
}
