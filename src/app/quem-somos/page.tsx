import type { Metadata } from 'next'
import Image from 'next/image'
import {
  Check, Shield, Clock, Globe, Car, Headphones,
  Star, Users, MapPin, Award,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'
import { getOrganizationSchema } from '@/lib/json-ld'

const numeros = [
  { valor: '4.800+', label: 'Viagens realizadas' },
  { valor: '89', label: 'Motoristas ativos' },
  { valor: '4.9', label: 'Avaliação média' },
  { valor: '3', label: 'Idiomas atendidos' },
]

const valores = [
  {
    icon: Shield,
    titulo: 'Segurança acima de tudo',
    desc: 'Motoristas certificados, veículos com revisão periódica e rastreamento GPS em tempo real em cada viagem.',
  },
  {
    icon: Clock,
    titulo: 'Pontualidade como compromisso',
    desc: 'Monitoramos os voos automaticamente. Atrasos não afetam sua viagem — nosso motorista já está informado.',
  },
  {
    icon: Globe,
    titulo: 'Hospitalidade multilíngue',
    desc: 'Atendemos em português, inglês e espanhol. Passageiros de qualquer país chegam e partem com total conforto.',
  },
  {
    icon: Car,
    titulo: 'Frota premium',
    desc: 'Veículos novos, climatizados e com espaço generoso para bagagens. Conforto desde o primeiro instante.',
  },
  {
    icon: Headphones,
    titulo: 'Suporte 24 horas',
    desc: 'Nossa equipe está disponível a qualquer hora para resolver imprevistos e garantir sua tranquilidade.',
  },
  {
    icon: Award,
    titulo: 'Transparência total',
    desc: 'Orçamento sem surpresas, sem taxas ocultas. O preço combinado é o preço pago — simples assim.',
  },
]

const frota = [
  {
    tipo: 'Sedan Executivo',
    exemplos: 'Toyota Corolla, Honda Civic',
    capacidade: 'Até 3 passageiros',
    bagagens: '3 malas grandes',
    ideal: 'Casais e viajantes individuais',
  },
  {
    tipo: 'SUV Premium',
    exemplos: 'Hyundai Tucson, Toyota RAV4',
    capacidade: 'Até 4 passageiros',
    bagagens: '4 malas grandes',
    ideal: 'Famílias e grupos pequenos',
  },
  {
    tipo: 'Van Executiva',
    exemplos: 'Mercedes Sprinter, Iveco Daily',
    capacidade: 'Até 10 passageiros',
    bagagens: 'Volume ampliado',
    ideal: 'Grupos e eventos corporativos',
  },
]

export default function QuemSomosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              getOrganizationSchema(),
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://aguaverde.tur.br' },
                  { '@type': 'ListItem', position: 2, name: 'Quem Somos', item: 'https://aguaverde.tur.br/quem-somos' },
                ],
              },
            ],
          }),
        }}
      />

      <Header />

      <main className="pt-16 lg:pt-20">
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="relative py-24 bg-[#0d2e1c] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 bg-[#27ae60]/20 text-[#27ae60] text-sm font-semibold rounded-full mb-6">
              Nossa história
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
              Quem somos
            </h1>
            <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto">
              Uma empresa pernambucana dedicada a tornar cada transfer uma experiência
              segura, confortável e sem imprevistos.
            </p>
          </div>
        </section>

        {/* ── NÚMEROS ───────────────────────────────────────────── */}
        <section className="bg-[#1a5c38] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {numeros.map((n) => (
                <div key={n.label}>
                  <p className="text-3xl lg:text-4xl font-heading font-bold text-white mb-1">
                    {n.valor}
                  </p>
                  <p className="text-xs text-white/60">{n.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HISTÓRIA ──────────────────────────────────────────── */}
        <section className="py-24 bg-[#fafbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative h-80 lg:h-[480px] rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=1200&auto=format&fit=crop"
                  alt="Recife, Pernambuco — cidade onde a Água Verde Transfers nasceu"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/50 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#1a5c38] text-xs font-bold rounded-full">
                    Recife, Pernambuco — Brasil
                  </span>
                </div>
              </div>

              <div>
                <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
                  Nossa trajetória
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-6">
                  Nascemos em Recife para conectar pessoas a destinos
                </h2>
                <div className="space-y-4 text-[#5a6570] leading-relaxed">
                  <p>
                    A Água Verde Transfers nasceu da percepção de que o turismo receptivo
                    em Pernambuco merecia um serviço de transfer à altura da beleza dos seus
                    destinos. Fundada em Recife, a empresa começou oferecendo transfers do
                    aeroporto para os principais destinos do litoral sul: Porto de Galinhas,
                    Maragogi e Praia de Carneiros.
                  </p>
                  <p>
                    Com o tempo, construímos um ecossistema digital próprio: sistema de
                    gestão de viagens, rastreamento GPS em tempo real e app exclusivo para
                    motoristas. Hoje, mais de 4.800 viagens realizadas refletem um padrão de
                    serviço que combina tecnologia com o calor humano pernambucano.
                  </p>
                  <p>
                    Atendemos passageiros do Brasil inteiro e de mais de 20 países —
                    argentinos, uruguaios, europeus, americanos. Para todos, a mesma
                    qualidade: pontualidade, conforto e comunicação sem barreiras.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {[
                    'Empresa 100% pernambucana',
                    'Tecnologia própria',
                    'Operação 24 horas',
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#1a5c38]/10 rounded-full text-sm text-[#1a1a2e]"
                    >
                      <Check className="w-3.5 h-3.5 text-[#27ae60]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALORES ───────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
                Nossos valores
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                O que guia cada viagem que realizamos
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {valores.map((v) => (
                <div
                  key={v.titulo}
                  className="p-6 bg-[#fafbfa] rounded-2xl border border-[#1a5c38]/5 hover:border-[#1a5c38]/10 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-[#1a5c38]/10 rounded-xl flex items-center justify-center mb-4">
                    <v.icon className="w-6 h-6 text-[#1a5c38]" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-[#1a1a2e] mb-2">
                    {v.titulo}
                  </h3>
                  <p className="text-sm text-[#5a6570] leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FROTA ─────────────────────────────────────────────── */}
        <section className="py-24 bg-[#fafbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#d4a853]/15 text-[#b08d3f] text-sm font-semibold rounded-full mb-4">
                Nossa frota
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
                Veículos para cada necessidade
              </h2>
              <p className="text-[#5a6570] max-w-xl mx-auto">
                Todos os veículos são novos, climatizados e regularmente revisados.
                Escolha o modelo certo para o tamanho do seu grupo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {frota.map((f) => (
                <div
                  key={f.tipo}
                  className="bg-white rounded-2xl p-6 border border-[#1a5c38]/8 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-[#1a5c38]/10 rounded-xl flex items-center justify-center mb-5">
                    <Car className="w-6 h-6 text-[#1a5c38]" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-[#1a1a2e] mb-1">
                    {f.tipo}
                  </h3>
                  <p className="text-sm text-[#5a6570] mb-5">{f.exemplos}</p>
                  <ul className="space-y-2">
                    {[
                      { label: 'Capacidade', value: f.capacidade },
                      { label: 'Bagagens', value: f.bagagens },
                      { label: 'Ideal para', value: f.ideal },
                    ].map((item) => (
                      <li key={item.label} className="flex items-start justify-between text-sm gap-3">
                        <span className="text-[#5a6570] shrink-0">{item.label}</span>
                        <span className="text-[#1a1a2e] font-medium text-right">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MOTORISTAS ────────────────────────────────────────── */}
        <section className="py-24 bg-[#0d2e1c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-[#27ae60]/20 text-[#27ae60] text-sm font-semibold rounded-full mb-6">
                  Nossa equipe
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-6">
                  89 motoristas. Uma só cultura de excelência.
                </h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Cada motorista da Água Verde passa por um processo seletivo rigoroso e
                  treinamento contínuo. Documentação em dia, experiência comprovada e postura
                  profissional são requisitos inegociáveis.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Shield, text: 'Documentação verificada' },
                    { icon: Star, text: 'Avaliação contínua' },
                    { icon: Globe, text: 'Comunicação multilíngue' },
                    { icon: Users, text: 'Treinamento periódico' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#27ae60]/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#27ae60]" />
                      </div>
                      <span className="text-sm text-white/80">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '89', label: 'Motoristas ativos', sub: 'Na plataforma' },
                  { value: '4.9', label: 'Avaliação média', sub: 'Em 47+ avaliações' },
                  { value: '100%', label: 'Rastreados', sub: 'GPS em tempo real' },
                  { value: '24h', label: 'Disponibilidade', sub: 'Todos os dias' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center"
                  >
                    <p className="text-3xl font-heading font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-white/80">{stat.label}</p>
                    <p className="text-xs text-white/40 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DADOS INSTITUCIONAIS ──────────────────────────────── */}
        <section className="py-16 bg-[#fafbfa] border-t border-[#1a5c38]/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-sm font-semibold text-[#5a6570] uppercase tracking-wider mb-4">
              Água Verde Transfers
            </h2>
            <p className="text-sm text-[#5a6570] leading-relaxed">
              R. Jonathas de Vasconcelos, 13 — Sala 7 e 8 — Boa Viagem, Recife — PE, 51021-140<br />
              CNPJ: 17.427.292/0001-4
            </p>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
              Pronto para sua próxima viagem?
            </h2>
            <p className="text-[#5a6570] mb-8">
              Solicite um orçamento sem compromisso. Respondemos em até 30 minutos.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/#orcamento"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1a5c38] text-white font-semibold rounded-full hover:bg-[#27ae60] transition-colors"
              >
                Solicitar orçamento grátis
              </a>
              <a
                href="https://wa.me/558199473200"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#1a5c38]/20 text-[#1a5c38] font-semibold rounded-full hover:border-[#1a5c38]/40 transition-colors"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
