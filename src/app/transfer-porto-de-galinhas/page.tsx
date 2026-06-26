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
import { FaqAccordion } from '@/components/transfer-porto-de-galinhas/FaqAccordion'

export const metadata: Metadata = {
  title: 'Transfer Privado para Porto de Galinhas | Água Verde — Aeroporto de Recife',
  description:
    'Transfer privado do aeroporto de Recife (REC) para Porto de Galinhas. ~70 km, ~1h15min, a partir de R$ 350. Motoristas profissionais, monitoramento de voo em tempo real, frota climatizada. Reserve agora.',
  keywords: [
    'transfer porto de galinhas',
    'transfer aeroporto recife porto de galinhas',
    'transfer privado porto de galinhas',
    'como ir aeroporto recife porto de galinhas',
    'transporte aeroporto porto de galinhas',
    'transfer recife porto de galinhas preço',
  ],
  openGraph: {
    title: 'Transfer Privado Aeroporto Recife → Porto de Galinhas | Água Verde',
    description:
      'Transfer privado do aeroporto de Recife para Porto de Galinhas. A partir de R$ 350. Monitoramento de voo incluso.',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Transfer privado para Porto de Galinhas - Água Verde Transfers',
      },
    ],
  },
  alternates: {
    canonical: '/transfer-porto-de-galinhas',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Transfer Privado Aeroporto do Recife → Porto de Galinhas',
      description:
        'Transfer privado com veículo exclusivo entre o Aeroporto Internacional do Recife (REC) e Porto de Galinhas, Pernambuco. Motoristas profissionais, frota climatizada e monitoramento de voo em tempo real.',
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
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -8.05428,
          longitude: -34.8813,
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
        { '@type': 'Place', name: 'Porto de Galinhas' },
      ],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: '350',
        priceValidUntil: '2026-12-31',
        description: 'Transfer privado para grupos de 1 a 3 passageiros',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto tempo leva o transfer do aeroporto de Recife para Porto de Galinhas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Aproximadamente 1 hora e 15 minutos (~70 km pela BR-101). Em alta temporada pode ser até 1h30.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual o preço do transfer do aeroporto de Recife para Porto de Galinhas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A partir de R$ 350 para grupos de 1 a 3 passageiros em veículo climatizado.',
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
          name: 'É possível contratar transfer de volta Porto de Galinhas → Aeroporto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, nos dois sentidos e também combo (ida + volta) com condições especiais.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://aguaverde.tur.br' },
        { '@type': 'ListItem', position: 2, name: 'Transfer Porto de Galinhas', item: 'https://aguaverde.tur.br/transfer-porto-de-galinhas' },
      ],
    },
  ],
}

const rotas = [
  {
    origem: 'Aeroporto do Recife (REC)',
    destino: 'Porto de Galinhas',
    preco: 350,
    duracao: '1h 15min',
    distancia: '~70 km',
    pax: '1–3',
    destaque: true,
    tag: 'Mais reservado',
  },
  {
    origem: 'Porto de Galinhas',
    destino: 'Aeroporto do Recife (REC)',
    preco: 350,
    duracao: '1h 15min',
    distancia: '~70 km',
    pax: '1–3',
    destaque: false,
    tag: null,
  },
  {
    origem: 'Recife Centro / Hotel',
    destino: 'Porto de Galinhas',
    preco: 320,
    duracao: '1h 10min',
    distancia: '~65 km',
    pax: '1–3',
    destaque: false,
    tag: 'Mais econômico',
  },
]

const diferenciais = [
  {
    icon: Plane,
    title: 'Monitoramento do voo em tempo real',
    desc: 'Acompanhamos seu voo automaticamente. Atraso, adiantamento ou desvio de rota — seu motorista já está informado antes de você desembarcar.',
  },
  {
    icon: Navigation,
    title: 'Meet & Greet no desembarque',
    desc: 'Seu motorista estará no saguão de chegada com plaquinha e pronto para ajudar com as bagagens. Nada de procurar carro ou esperar do lado de fora.',
  },
  {
    icon: Car,
    title: 'Frota climatizada e rastreada',
    desc: 'Veículos novos, com ar-condicionado, Wi-Fi e espaço amplo para malas. GPS em tempo real para sua segurança e tranquilidade.',
  },
  {
    icon: Headphones,
    title: 'Atendimento 24h em PT / EN / ES',
    desc: 'Nossa equipe responde em português, inglês e espanhol. Suporte antes, durante e após a viagem — por WhatsApp, sempre.',
  },
  {
    icon: Shield,
    title: 'Sem cobrança por atraso de voo',
    desc: 'Atrasos aéreos fazem parte da viagem. Por isso nosso preço já inclui tempo de espera razoável. Seu orçamento é transparente desde o início.',
  },
]

const depoimentos = [
  {
    nome: 'Graciela Cristina Prille',
    origem: 'Argentina',
    nota: 5,
    texto:
      'Viajamos em família para Porto de Galinhas e o transfer foi perfeito. Cadeirinha infantil disponível e motorista muito atencioso. Voltaremos a usar!',
    data: 'Janeiro 2026',
  },
  {
    nome: 'Claudio Gabriel Martinez',
    origem: 'Argentina',
    nota: 5,
    texto:
      'Contratei o transfer do aeroporto para o hotel e depois para Porto de Galinhas. Em ambos os trajetos o serviço foi excelente. Organização total.',
    data: 'Janeiro 2026',
  },
  {
    nome: 'Oscar Barrios',
    origem: 'Uruguai',
    nota: 5,
    texto:
      'A melhor opção de transfer em Recife. Preço justo, frota nova e atendimento em espanhol que facilitou muito nossa comunicação. Nota 10!',
    data: 'Março 2026',
  },
]

export default function TransferPortoDeGalinhasPage() {
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
          {/* Background */}
          <Image
            src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2400&auto=format&fit=crop"
            alt="Praia de Porto de Galinhas com piscinas naturais de águas cristalinas"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          {/* Layered overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d2e1c]/92 via-[#0d2e1c]/75 to-[#0d2e1c]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/70 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

              {/* Left: main copy */}
              <div className="lg:col-span-7">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-white/50 text-xs mb-6 animate-fade-in">
                  <a href="/" className="hover:text-white/80 transition-colors">Início</a>
                  <span>/</span>
                  <span className="text-white/70">Transfer Porto de Galinhas</span>
                </nav>

                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4a853]/20 border border-[#d4a853]/30 rounded-full mb-6 animate-fade-in-up"
                  style={{ animationDelay: '0.1s' }}
                >
                  <span className="w-2 h-2 bg-[#d4a853] rounded-full animate-pulse" />
                  <span className="text-[#d4a853] text-sm font-semibold">
                    Rota mais reservada em Recife
                  </span>
                </div>

                {/* H1 */}
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white leading-[1.1] mb-6 animate-fade-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  Transfer Privado para{' '}
                  <span className="relative text-[#d4a853]">
                    Porto de Galinhas
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#d4a853]/40 rounded-full" />
                  </span>
                </h1>

                {/* Subtitle */}
                <p
                  className="text-lg lg:text-xl text-white/80 mb-8 max-w-xl leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  Do aeroporto de Recife direto para as piscinas naturais mais famosas do
                  Brasil. Conforto, pontualidade e motorista que monitora seu voo.
                </p>

                {/* Route visual */}
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
                    <span className="text-[#d4a853] text-xs font-medium">Porto de Galinhas, PE</span>
                  </div>
                </div>

                {/* CTAs */}
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

              {/* Right: floating price card — desktop only */}
              <div
                className="hidden lg:block lg:col-span-5 animate-fade-in-up"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
                  <p className="text-white/60 text-sm font-medium mb-1">Transfer privado a partir de</p>
                  <p className="text-6xl font-heading font-bold text-white mb-1">R$ 350</p>
                  <p className="text-white/50 text-xs mb-8">Grupos de 1 a 3 passageiros</p>

                  <div className="space-y-4 mb-8">
                    {[
                      { icon: Clock, text: '~1h 15min de percurso' },
                      { icon: Navigation, text: '~70 km via BR-101' },
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

          {/* Scroll indicator */}
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
                { value: '~70 km', label: 'Distância total' },
                { value: '~1h 15min', label: 'Tempo médio de percurso' },
                { value: 'R$ 350', label: 'A partir de (1–3 pax)' },
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

                  {/* Route */}
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

                  {/* Meta */}
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
              {/* Left: image */}
              <div className="relative h-80 lg:h-full min-h-[420px] rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"
                  alt="Piscinas naturais de Porto de Galinhas com água cristalina"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/40 to-transparent" />

                {/* Floating stat card */}
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

              {/* Right: diferenciais list */}
              <div>
                <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
                  Por que Água Verde?
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                  O transfer que cuida de cada detalhe
                </h2>
                <p className="text-[#5a6570] mb-10 leading-relaxed">
                  Mais de 4.800 viagens realizadas no Nordeste. Cada rota para Porto de
                  Galinhas é tratada com o mesmo cuidado da primeira.
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

        {/* ── SOBRE PORTO DE GALINHAS ───────────────────────────── */}
        <section className="py-24 bg-[#fafbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-[#d4a853]/15 text-[#b08d3f] text-sm font-semibold rounded-full mb-4">
                Sobre o Destino
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                Porto de Galinhas: o paraíso a 70 km de Recife
              </h2>
              <p className="text-[#5a6570] max-w-2xl mx-auto">
                Entenda por que Porto de Galinhas é o destino praiano mais procurado do
                Nordeste — e como chegar com total conforto.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main article */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=1400&auto=format&fit=crop"
                    alt="Vista aérea de Porto de Galinhas com recifes de corais e piscinas naturais"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-[#d4a853]/90 text-white text-xs font-bold rounded-full">
                      Porto de Galinhas — Ipojuca, PE
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#1a5c38]/5">
                  <h3 className="font-heading font-bold text-xl text-[#1a1a2e] mb-4">
                    O que torna Porto de Galinhas único?
                  </h3>
                  <div className="prose-sm text-[#5a6570] space-y-4 leading-relaxed">
                    <p>
                      Porto de Galinhas é uma praia localizada no município de Ipojuca, a
                      aproximadamente 70 km ao sul de Recife. Eleita diversas vezes a mais
                      bela praia do Brasil, é famosa pelas suas{' '}
                      <strong className="text-[#1a1a2e]">piscinas naturais</strong> formadas
                      pelos recifes de corais, que criam lagoas rasas de água cristalina em
                      tons de verde e azul-turquesa.
                    </p>
                    <p>
                      O passeio de <strong className="text-[#1a1a2e]">jangada</strong> até as
                      piscinas naturais é a principal atração. Nas piscinas, a visibilidade da
                      água permite ver os peixes coloridos a olho nu — uma experiência única,
                      especialmente para famílias com crianças.
                    </p>
                    <p>
                      Além das piscinas, Porto de Galinhas oferece um centro turístico
                      movimentado com restaurantes de frutos do mar, pousadas e hotéis boutique,
                      buggies pelas dunas e praias tranquilas como Muro Alto, Maracaípe e
                      Cupe — cada uma com um caráter diferente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info cards sidebar */}
              <div className="space-y-4">
                {[
                  {
                    title: 'Localização',
                    items: [
                      'Ipojuca, Pernambuco',
                      '70 km ao sul de Recife',
                      '80 km do aeroporto REC',
                      '290 km de Maceió (AL)',
                    ],
                  },
                  {
                    title: 'Melhor época para visitar',
                    items: [
                      'Out – Mar: clima mais seco',
                      'Abr – Jun: menos movimento',
                      'Jul – Ago: alta temporada fria',
                      'Jan – Fev: verão com chuvas',
                    ],
                  },
                  {
                    title: 'Principais atrações',
                    items: [
                      'Piscinas naturais de corais',
                      'Passeio de jangada',
                      'Praia de Muro Alto',
                      'Maracaípe (surfistas)',
                      'Centro gastronômico',
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

                {/* CTA */}
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
                Quem já foi a Porto de Galinhas com a gente
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                O que dizem nossos passageiros
              </h2>
              <p className="text-[#5a6570] max-w-xl mx-auto">
                Avaliações reais de quem chegou a Porto de Galinhas com a Água Verde.
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
                Tudo sobre o transfer Recife → Porto de Galinhas
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
              {/* Left */}
              <div className="lg:sticky lg:top-24">
                <span className="inline-block px-4 py-1.5 bg-[#27ae60]/20 text-[#27ae60] text-sm font-semibold rounded-full mb-6">
                  Orçamento Grátis
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
                  Reserve seu transfer para Porto de Galinhas
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

              {/* Right: Form */}
              <FormOrcamento
                initialOrigem="Aeroporto do Recife (REC)"
                initialDestino="Porto de Galinhas"
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
