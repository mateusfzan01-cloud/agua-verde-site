import { Star, Quote } from 'lucide-react'

const depoimentos = [
  {
    nome: 'Fernando Campos',
    origem: 'Portugal',
    nota: 5,
    texto: 'Serviço impecável! Motorista pontual, veículo limpo e confortável. Já utilizei 10 vezes e sempre com a mesma excelência. Recomendo fortemente.',
    data: 'Março 2026',
  },
  {
    nome: 'Guido Rafael Repiso',
    origem: 'Argentina',
    nota: 5,
    texto: 'Excelente atendimento desde a reserva até o final da viagem. O motorista acompanhou nosso voo com atraso e nos aguardou sem problemas. Muito profissional.',
    data: 'Fevereiro 2026',
  },
  {
    nome: 'Graciela Cristina Prille',
    origem: 'Argentina',
    nota: 5,
    texto: 'Viajamos em família para Porto de Galinhas e o transfer foi perfeito. Cadeirinha infantil disponível e motorista muito atencioso. Voltaremos a usar!',
    data: 'Janeiro 2026',
  },
  {
    nome: 'Oscar Barrios',
    origem: 'Uruguai',
    nota: 5,
    texto: 'A melhor opção de transfer em Recife. Preço justo, frota nova e atendimento em espanhol que facilitou muito nossa comunicação. Nota 10!',
    data: 'Março 2026',
  },
  {
    nome: 'Claudio Gabriel Martinez',
    origem: 'Argentina',
    nota: 5,
    texto: 'Contratei o transfer do aeroporto para o hotel e depois para Porto de Galinhas. Em ambos os trajetos o serviço foi excelente. Organização total.',
    data: 'Janeiro 2026',
  },
  {
    nome: 'Sidnei Schestatsky',
    origem: 'Brasil',
    nota: 5,
    texto: 'Moro em Porto Alegre e sempre que venho a Recife uso a Água Verde. É minha escolha certa. Confiável, pontual e com preço justo.',
    data: 'Fevereiro 2026',
  },
]

export function Depoimentos() {
  return (
    <section id="depoimentos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#d4a853]/10 text-[#b08d3f] text-sm font-semibold rounded-full mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1a1a2e] mb-4">
            O que dizem nossos passageiros
          </h2>
          <p className="text-lg text-[#5a6570] max-w-2xl mx-auto">
            Avaliações verificadas de passageiros reais. Média de 4.9 estrelas em mais de 47 viagens avaliadas.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depoimentos.map((depoimento, index) => (
            <div
              key={index}
              className="relative p-6 bg-[#fafbfa] rounded-2xl border border-[#1a5c38]/5 hover:border-[#1a5c38]/10 transition-colors"
            >
              <Quote className="w-8 h-8 text-[#d4a853]/30 mb-4" />
              
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < depoimento.nota
                        ? 'text-[#d4a853] fill-[#d4a853]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[#1a1a2e] leading-relaxed mb-6 text-sm">
                &ldquo;{depoimento.texto}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#1a5c38]/5">
                <div>
                  <p className="font-semibold text-[#1a1a2e] text-sm">{depoimento.nome}</p>
                  <p className="text-xs text-[#5a6570]">{depoimento.origem}</p>
                </div>
                <span className="text-xs text-[#5a6570]">{depoimento.data}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
