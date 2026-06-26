import Image from 'next/image'
import { MapPin, ArrowRight, Clock, Users } from 'lucide-react'

const rotas = [
  {
    origem: 'Aeroporto do Recife (REC)',
    destino: 'Porto de Galinhas',
    preco: 350,
    duracao: '1h 15min',
    pax: '1-3',
    imagem: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1000&auto=format&fit=crop',
    popular: true,
    landingPage: '/transfer-porto-de-galinhas',
  },
  {
    origem: 'Porto de Galinhas',
    destino: 'Aeroporto do Recife (REC)',
    preco: 350,
    duracao: '1h 15min',
    pax: '1-3',
    imagem: 'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=1000&auto=format&fit=crop',
    popular: true,
    landingPage: '/transfer-porto-de-galinhas',
  },
  {
    origem: 'Aeroporto do Recife (REC)',
    destino: 'Maragogi',
    preco: 580,
    duracao: '2h 30min',
    pax: '1-3',
    imagem: 'https://images.pexels.com/photos/18146825/pexels-photo-18146825.jpeg?auto=compress&cs=tinysrgb&w=1000',
    popular: false,
    landingPage: '/transfer-maragogi',
  },
  {
    origem: 'Aeroporto do Recife (REC)',
    destino: 'Praia de Carneiros',
    preco: 420,
    duracao: '1h 45min',
    pax: '1-3',
    imagem: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000&auto=format&fit=crop',
    popular: false,
    landingPage: '/transfer-praia-de-carneiros',
  },
]

export function RotasGrid() {
  return (
    <section id="rotas" className="py-24 bg-[#fafbfa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
            Rotas Populares
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1a1a2e] mb-4">
            Para onde você vai?
          </h2>
          <p className="text-lg text-[#5a6570] max-w-2xl mx-auto">
            As rotas mais solicitadas pelos nossos passageiros. Preços a partir de valores para grupos de 1-3 pessoas.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {rotas.map((rota, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden border border-[#1a5c38]/5 shadow-sm hover:shadow-xl hover:shadow-[#1a5c38]/5 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <Image
                  src={rota.imagem}
                  alt={`${rota.origem} → ${rota.destino}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {rota.popular && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#d4a853] text-white text-xs font-bold rounded-full">
                    Mais Popular
                  </span>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white text-sm mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{rota.origem}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <div className="w-4 h-px bg-white/50" />
                    <span>{rota.destino}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-[#5a6570]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {rota.duracao}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {rota.pax} pax
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#5a6570] mb-1">A partir de</p>
                    <p className="text-2xl font-heading font-bold text-[#1a5c38]">
                      R$ {rota.preco}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {rota.landingPage && (
                      <a
                        href={rota.landingPage}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-[#1a5c38] text-sm font-medium rounded-full border border-[#1a5c38]/20 hover:bg-[#1a5c38]/5 transition-colors"
                      >
                        Ver detalhes
                      </a>
                    )}
                    <a
                      href={rota.landingPage ? `${rota.landingPage}#orcamento` : '#orcamento'}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a5c38] text-white text-sm font-medium rounded-full hover:bg-[#1a5c38]/90 transition-colors"
                    >
                      Orçamento
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
