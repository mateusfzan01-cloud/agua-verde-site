import type { Metadata } from 'next'
import Image from 'next/image'
import {
  ArrowRight, Check, Clock, MapPin, MessageCircle,
  Shield, Star, Users, Car, Headphones, Plane,
  ChevronDown, Quote, Navigation,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'
import { FormOrcamento } from '@/components/home/FormOrcamento'
import { FaqAccordion } from '@/components/transfer-praia-de-carneiros/FaqAccordion'

export const metadata: Metadata = {
  title: 'Transfer Privado para Praia de Carneiros | Água Verde — Aeroporto de Recife',
  description:
    'Transfer privado do aeroporto de Recife (REC) para Praia de Carneiros, Tamandaré-PE. ~115 km, ~1h45min, a partir de R$ 420. Motoristas profissionais, monitoramento de voo. Reserve agora.',
  keywords: [
    'transfer praia de carneiros',
    'transfer aeroporto recife praia de carneiros',
    'transfer privado praia de carneiros',
    'como ir aeroporto recife praia de carneiros',
    'transporte praia de carneiros recife',
    'transfer tamandare pernambuco',
  ],
  openGraph: {
    title: 'Transfer Privado Aeroporto Recife → Praia de Carneiros | Água Verde',
    description:
      'Transfer privado do aeroporto de Recife para Praia de Carneiros. A partir de R$ 420. Monitoramento de voo incluso.',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Transfer privado para Praia de Carneiros - Água Verde Transfers',
      },
    ],
  },
  alternates: {
    canonical: '/transfer-praia-de-carneiros',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Transfer Privado Aeroporto do Recife → Praia de Carneiros',
      description:
        'Transfer privado com veículo exclusivo entre o Aeroporto Internacional do Recife (REC) e Praia de Carneiros, Tamandaré-PE. Motoristas profissionais, frota climatizada e monitoramento de voo em tempo real.',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Água Verde Transfers',
        url: 'https://aguaverde.tur.br',
        telephone: '+55-81-9947-3200',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Rua Jonathas de Vasconcelos, 13 - Sala 7 e 8 - Boa Viagem',
          addressLocality: 'Recife',
          addressRegion: 'PE',
          postalCode: '51021-140',
          addressCountry: 'BR',
        },
        priceRange: 'R$ 320 – R$ 580',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '47',
        },
      },
      areaServed: [
        { '@type': 'City', name: 'Recife' },
        { '@type': 'Place', name: 'Praia de Carneiros' },
        { '@type': 'City', name: 'Tamandaré' },
      ],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: '420',
        priceValidUntil: '2026-12-31',
        description: 'Transfer privado para grupos de 1 a 3 passageiros',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto tempo leva o transfer do aeroporto de Recife para Praia de Carneiros?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Aproximadamente 1 hora e 45 minutos (~115 km pela BR-101 Sul). Em alta temporada pode ser até 2 horas.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual o preço do transfer do aeroporto de Recife para Praia de Carneiros?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A partir de R$ 420 para grupos de 1 a 3 passageiros em veículo climatizado.',
          },
        },
        {
          '@type': 'Question',
          name: 'O motorista espera se o voo atrasar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim. Monitoramos todos os voos em tempo real. O motorista aguarda no saguão sem cobrança adicional.',
          },
        },
        {
          '@type': 'Question',
          name: 'Praia de Carneiros fica próxima de Porto de Galinhas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, Praia de Carneiros fica a cerca de 50 km ao sul de Porto de Galinhas, em Tamandaré-PE. É um destino mais tranquilo e privativo.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://aguaverde.tur.br' },
        { '@type': 'ListItem', position: 2, name: 'Transfer Praia de Carneiros', item: 'https://aguaverde.tur.br/transfer-praia-de-carneiros' },
      ],
    },
  ],
}

const rotas = [
  {
    origem: 'Aeroporto do Recife (REC)',
    destino: 'Praia de Carneiros',
    preco: 420,
    duracao: '1h 45min',
    distancia: '~115 km',
    pax: '1–3',
    destaque: true,
    tag: 'Mais reservado',
  },
  {
    origem: 'Praia de Carneiros',
    destino: 'Aeroporto do Recife (REC)',
    preco: 420,
    duracao: '1h 45min',
    distancia: '~115 km',
    pax: '1–3',
    destaque: false,
    tag: null,
  },
  {
    origem: 'Recife Centro / Hotel',
    destino: 'Praia de Carneiros',
    preco: 400,
    duracao: '1h 40min',
    distancia: '~110 km',
    pax: '1–3',
    destaque: false,
    tag: 'Saída do hotel',
  },
]

const diferenciais = [
  {
    icon: Plane,
    title: 'Monitoramento do voo em tempo real',
    desc: 'Acompanhamos seu voo automaticamente. Atraso, adiantamento ou mudança de portão — seu motorista já está informado antes de você desembarcar.',
  },
  {
    icon: Navigation,
    title: 'Meet & Greet no desembarque',
    desc: 'Seu motorista estará no saguão de chegada com plaquinha e pronto para ajudar com as bagagens. Nada de procurar carro ou esperar do lado de fora.',
  },
  {
    icon: Car,
    title: 'Frota climatizada e rastreada',
    desc: 'Veículos novos, com ar-condicionado e espaço amplo para malas — essencial para a viagem até Tamandaré. GPS em tempo real durante todo o percurso.',
  },
  {
    icon: Headphones,
    title: 'Atendimento 24h em PT / EN / ES',
    desc: 'Nossa equipe responde em português, inglês e espanhol. Suporte antes, durante e após a viagem — por WhatsApp, sempre.',
  },
  {
    icon: Shield,
    title: 'Sem cobrança por atraso de voo',
    desc: 'Atrasos aéreos são comuns. Por isso nosso preço já inclui tempo de espera razoável. Seu orçamento é transparente desde o início, sem surpresas.',
  },
]

const depoimentos = [
  {
    nome: 'Fernando Campos',
    origem: 'Portugal',
    nota: 5,
    texto:
      'Serviço impecável! Motorista pontual, veículo limpo e confortável. Já utilizei 10 vezes e sempre com a mesma excelência. Recomendo fortemente.',
    data: 'Março 2026',
  },
  {
    nome: 'Guido Rafael Repiso',
    origem: 'Argentina',
    nota: 5,
    texto:
      'Excelente atendimento desde a reserva até o final da viagem. O motorista acompanhou nosso voo com atraso e nos aguardou sem problemas. Muito profissional.',
    data: 'Fevereiro 2026',
  },
  {
    nome: 'Sidnei Schestatsky',
    origem: 'Brasil',
    nota: 5,
    texto:
      'Moro em Porto Alegre e sempre que venho ao Nordeste uso a Água Verde. É minha escolha certa. Confiável, pontual e com preço justo.',
    data: 'Fevereiro 2026',
  },
]

export default function TransferPraiaDeCarneirosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main>
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center pt-16">
          <Image
            src="https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2400&auto=format&fit=crop"
            alt="Praia de Carneiros em Tamandaré, Pernambuco — águas calmas e coqueiros"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0d2e1c]/92 via-[#0d2e1c]/75 to-[#0d2e1c]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/70 via-transparent to-transparent" />

          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

              <div className="lg:col-span-7">
                <nav className="flex items-center gap-2 text-white/50 text-xs mb-6 animate-fade-in">
                  <a href="/" className="hover:text-white/80 transition-colors">Início</a>
                  <span>/</span>
                  <span className="text-white/70">Transfer Praia de Carneiros</span>
                </nav>

                <div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4a853]/20 border border-[#d4a853]/30 rounded-full mb-6 animate-fade-in-up"
                  style={{ animationDelay: '0.1s' }}
                >
                  <span className="w-2 h-2 bg-[#d4a853] rounded-full animate-pulse" />
                  <span className="text-[#d4a853] text-sm font-semibold">
                    O paraíso mais tranquilo de Pernambuco
                  </span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white leading-[1.1] mb-6 animate-fade-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  Transfer Privado para{' '}
                  <span className="relative text-[#d4a853]">
                    Praia de Carneiros
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#d4a853]/40 rounded-full" />
                  </span>
                </h1>

                <p
                  className="text-lg lg:text-xl text-white/80 mb-8 max-w-xl leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  Do aeroporto de Recife até as águas mais calmas de Pernambuco.
                  Veículo exclusivo, motorista profissional e monitoramento do voo incluso.
                </p>

                <div
                  className="flex items-center gap-3 mb-8 animate-fade-in-up"
                  style={{ animationDelay: '0.35s' }}
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-white/80 text-xs font-medium">Aeroporto REC</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/30">
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span className="w-5 border-t border-dashed border-current" />
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#d4a853]/20 border border-[#d4a853]/30 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-[#d4a853]" />
                    <span className="text-[#d4a853] text-xs font-medium">Praia de Carneiros, Tamandaré-PE</span>
                  </div>
                </div>

                <div
                  className="flex flex-wrap gap-4 animate-fade-in-up"
                  style={{ animationDelay: '0.45s' }}
                >
                  <a
                    href="#orcamento"
                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#1a5c38] text-white font-semibold rounded-full hover:bg-[#27ae60] transition-all shadow-lg shadow-[#1a5c38]/30 hover:shadow-[#27ae60]/30 hover:scale-[1.02]"
                  >
                    Solicitar Orçamento
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href="https://wa.me/558199473200"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                </div>
              </div>

              <div
                className="hidden lg:block lg:col-span-5 animate-fade-in-up"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
                  <p className="text-white/60 text-sm font-medium mb-1">Transfer privado a partir de</p>
                  <p className="text-6xl font-heading font-bold text-white mb-1">R$ 420</p>
                  <p className="text-white/50 text-xs mb-8">Grupos de 1 a 3 passageiros</p>

                  <div className="space-y-4 mb-8">
                    {[
                      { icon: Clock, text: '~1h 45min de percurso' },
                      { icon: Navigation, text: '~115 km via BR-101 Sul' },
                      { icon: Car, text: 'Veículo climatizado exclusivo' },
                      { icon: Plane, text: 'Monitoramento de voo incluído' },
                      { icon: Users, text: 'Cadeirinha infantil disponível' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-white/75 text-sm">
                        <Icon className="w-4 h-4 text-[#d4a853] shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href="#orcamento"
                    className="block text-center px-6 py-3.5 bg-[#1a5c38] text-white font-semibold rounded-full hover:bg-[#27ae60] transition-colors"
                  >
                    Reservar agora
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
            <span className="text-xs">Explorar</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </section>

        {/* ── STATS BAR ─────────────────────────────────────────── */}
        <section className="bg-[#1a5c38] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { value: '~115 km', label: 'Distância total' },
                { value: '~1h 45min', label: 'Tempo médio de percurso' },
                { value: 'R$ 420', label: 'A partir de (1–3 pax)' },
                { value: '4.9 ★', label: 'Avaliação dos passageiros' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl lg:text-3xl font-heading font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROUTE CARDS ───────────────────────────────────────── */}
        <section className="py-24 bg-[#fafbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
                Opções de Transfer
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                Escolha o transfer ideal para você
              </h2>
              <p className="text-[#5a6570] max-w-xl mx-auto">
                Atendemos nos dois sentidos e também saídas do centro de Recife.
                Todos os veículos são climatizados e exclusivos para o seu grupo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rotas.map((rota) => (
                <div
                  key={rota.origem}
                  className={`relative bg-white rounded-2xl p-6 border transition-all hover:shadow-xl ${
                    rota.destaque
                      ? 'border-[#1a5c38]/30 shadow-lg shadow-[#1a5c38]/5 ring-1 ring-[#1a5c38]/20'
                      : 'border-[#1a5c38]/8 shadow-sm hover:shadow-[#1a5c38]/5'
                  }`}
                >
                  {rota.tag && (
                    <span
                      className={`absolute -top-3 left-6 px-3 py-1 text-xs font-bold rounded-full ${
                        rota.destaque
                          ? 'bg-[#1a5c38] text-white'
                          : 'bg-[#d4a853] text-white'
                      }`}
                    >
                      {rota.tag}
                    </span>
                  )}

                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#1a5c38] shrink-0" />
                      <span className="text-[#5a6570]">{rota.origem}</span>
                    </div>
                    <div className="ml-1 border-l-2 border-dashed border-[#1a5c38]/20 h-4" />
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#d4a853] shrink-0" />
                      <span className="font-semibold text-[#1a1a2e]">{rota.destino}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#5a6570] mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {rota.duracao}
                    </span>
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" />
                      {rota.distancia}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {rota.pax} pax
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[#5a6570] mb-0.5">A partir de</p>
                      <p className="text-3xl font-heading font-bold text-[#1a5c38]">
                        R$ {rota.preco}
                      </p>
                    </div>
                    <a
                      href="#orcamento"
                      className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${
                        rota.destaque
                          ? 'bg-[#1a5c38] text-white hover:bg-[#27ae60]'
                          : 'bg-[#1a5c38]/10 text-[#1a5c38] hover:bg-[#1a5c38]/15'
                      }`}
                    >
                      Orçamento
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIFERENCIAIS ──────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative h-80 lg:h-full min-h-[420px] rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
                  alt="Águas cristalinas e calmas de Praia de Carneiros, Tamandaré-PE"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/40 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#27ae60]/15 flex items-center justify-center shrink-0">
                      <Plane className="w-5 h-5 text-[#1a5c38]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#5a6570]">Voos monitorados em</p>
                      <p className="font-heading font-bold text-[#1a1a2e]">
                        Tempo real, automaticamente
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
                  Por que Água Verde?
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                  O transfer que cuida de cada detalhe
                </h2>
                <p className="text-[#5a6570] mb-10 leading-relaxed">
                  Mais de 4.800 viagens realizadas no Nordeste. A distância até Tamandaré
                  exige ainda mais conforto e planejamento — e é isso que entregamos.
                </p>

                <div className="space-y-6">
                  {diferenciais.map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#1a5c38]/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-[#1a5c38]" />
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-[#1a1a2e] mb-1">
                          {item.title}
                        </p>
                        <p className="text-sm text-[#5a6570] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOBRE PRAIA DE CARNEIROS ───────────────────────────── */}
        <section className="py-24 bg-[#fafbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-[#d4a853]/15 text-[#b08d3f] text-sm font-semibold rounded-full mb-4">
                Sobre o Destino
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                Praia de Carneiros: tranquilidade a 115 km de Recife
              </h2>
              <p className="text-[#5a6570] max-w-2xl mx-auto">
                Conheça o segredo mais bem guardado do litoral sul pernambucano — e por que
                cada vez mais viajantes escolhem Carneiros em vez de destinos mais badalados.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=1400&auto=format&fit=crop"
                    alt="Vista de Praia de Carneiros com coqueiros e mar tranquilo em Tamandaré-PE"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-[#d4a853]/90 text-white text-xs font-bold rounded-full">
                      Praia de Carneiros — Tamandaré, PE
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#1a5c38]/5">
                  <h3 className="font-heading font-bold text-xl text-[#1a1a2e] mb-4">
                    Por que Praia de Carneiros é especial?
                  </h3>
                  <div className="prose-sm text-[#5a6570] space-y-4 leading-relaxed">
                    <p>
                      Praia de Carneiros fica em Tamandaré, município a 115 km ao sul de
                      Recife. É conhecida como um dos destinos mais{' '}
                      <strong className="text-[#1a1a2e]">tranquilos e preservados</strong> do
                      litoral pernambucano — uma alternativa de alto padrão para quem busca
                      menos movimento do que em Porto de Galinhas, com as mesmas águas
                      cristalinas do litoral sul.
                    </p>
                    <p>
                      Um dos cartões-postais mais icônicos do Brasil é a{' '}
                      <strong className="text-[#1a1a2e]">
                        Igreja de São Benedito à beira-mar
                      </strong>{' '}
                      — uma pequena capela histórica construída diretamente sobre a areia da
                      praia, com o mar ao fundo. A cena é única no mundo e atrai fotógrafos e
                      casais para cerimônias ao pôr do sol.
                    </p>
                    <p>
                      As águas calmas, rasas e mornas de Carneiros formam piscinas naturais
                      protegidas por recifes, ideais para snorkeling e banho com crianças.
                      O entorno preservado — com coqueiros, mangues e vegetação nativa — dá
                      ao local um charme ainda mais raro no litoral brasileiro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'Localização',
                    items: [
                      'Tamandaré, Pernambuco',
                      '115 km ao sul de Recife',
                      '50 km ao sul de Porto de Galinhas',
                      'BR-101 Sul até Tamandaré',
                    ],
                  },
                  {
                    title: 'Melhor época para visitar',
                    items: [
                      'Out – Mar: clima mais seco',
                      'Abr – Jun: menos turistas',
                      'Fev – Mar: Carnaval animado',
                      'Jul: alta temporada de inverno',
                    ],
                  },
                  {
                    title: 'Principais atrações',
                    items: [
                      'Igreja de São Benedito à beira-mar',
                      'Piscinas naturais de corais',
                      'Snorkeling e mergulho',
                      'Passeio de jangada',
                      'Mangue e reserva ambiental',
                    ],
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="bg-white rounded-2xl p-5 border border-[#1a5c38]/5"
                  >
                    <h4 className="font-heading font-semibold text-[#1a1a2e] text-sm mb-3">
                      {card.title}
                    </h4>
                    <ul className="space-y-2">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-[#5a6570]">
                          <Check className="w-3.5 h-3.5 text-[#27ae60] shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <a
                  href="#orcamento"
                  className="block text-center px-6 py-4 bg-[#1a5c38] text-white font-semibold rounded-2xl hover:bg-[#27ae60] transition-colors"
                >
                  Reservar transfer agora
                  <span className="block text-xs text-white/70 font-normal mt-0.5">
                    Resposta em até 30 minutos
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── DEPOIMENTOS ───────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-[#d4a853]/15 text-[#b08d3f] text-sm font-semibold rounded-full mb-4">
                Passageiros que nos recomendam
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                O que dizem nossos passageiros
              </h2>
              <p className="text-[#5a6570] max-w-xl mx-auto">
                Avaliações reais de quem confiou na Água Verde para chegar ao seu destino.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {depoimentos.map((d, i) => (
                <div
                  key={i}
                  className="relative p-6 bg-[#fafbfa] rounded-2xl border border-[#1a5c38]/5"
                >
                  <Quote className="w-8 h-8 text-[#d4a853]/30 mb-4" />

                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`w-4 h-4 ${
                          j < d.nota ? 'text-[#d4a853] fill-[#d4a853]' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-[#1a1a2e] leading-relaxed mb-6 text-sm">
                    &ldquo;{d.texto}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[#1a5c38]/5">
                    <div>
                      <p className="font-semibold text-[#1a1a2e] text-sm">{d.nome}</p>
                      <p className="text-xs text-[#5a6570]">{d.origem}</p>
                    </div>
                    <span className="text-xs text-[#5a6570]">{d.data}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section className="py-24 bg-[#fafbfa]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
                Dúvidas Frequentes
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                Tudo sobre o transfer Recife → Praia de Carneiros
              </h2>
              <p className="text-[#5a6570]">
                Respostas para as principais perguntas antes de reservar seu transfer.
              </p>
            </div>

            <FaqAccordion />
          </div>
        </section>

        {/* ── CTA + FORM ────────────────────────────────────────── */}
        <section id="orcamento" className="py-24 bg-[#0d2e1c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="lg:sticky lg:top-24">
                <span className="inline-block px-4 py-1.5 bg-[#27ae60]/20 text-[#27ae60] text-sm font-semibold rounded-full mb-6">
                  Orçamento Grátis
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
                  Reserve seu transfer para Praia de Carneiros
                </h2>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                  Preencha o formulário e receba seu orçamento em até 30 minutos por
                  WhatsApp ou e-mail. Sem compromisso.
                </p>

                <div className="space-y-4 mb-10">
                  {[
                    'Resposta em até 30 minutos',
                    'Orçamento sem compromisso',
                    'Monitoramento do voo incluso',
                    'Atendimento em PT / EN / ES',
                    'PIX, cartão ou dinheiro',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#27ae60]/15 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-[#27ae60]" />
                      </div>
                      <span className="text-sm text-white/75">{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://wa.me/558199473200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar diretamente no WhatsApp
                </a>
              </div>

              <FormOrcamento
                initialOrigem="Aeroporto do Recife (REC)"
                initialDestino="Praia de Carneiros"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
