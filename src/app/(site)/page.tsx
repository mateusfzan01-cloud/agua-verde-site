import type { Metadata } from 'next'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { RotasGrid } from '@/components/home/RotasGrid'
import { Depoimentos } from '@/components/home/Depoimentos'
import { SocialProof } from '@/components/home/SocialProof'
import { FormOrcamento } from '@/components/home/FormOrcamento'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'
import { getOrganizationSchema } from '@/lib/json-ld'
import { Check, Clock, Shield, Globe, Car, Headphones, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Água Verde Transfers | Transfer Privado em Recife e Porto de Galinhas',
  description:
    'Transfer privado de qualidade no Recife, Porto de Galinhas, Maragogi e região. Motoristas profissionais, frota nova e atendimento em português, inglês e espanhol.',
  keywords: [
    'transfer recife',
    'transfer porto de galinhas',
    'transfer privado recife',
    'aeroporto recife transfer',
    'transfer praia de carneiros',
    'transporte recife porto de galinhas',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Água Verde Transfers | Transfer Privado em Recife e Porto de Galinhas',
    description:
      'Transfer privado de qualidade no Recife, Porto de Galinhas, Maragogi e região. Motoristas profissionais, frota nova e atendimento em português, inglês e espanhol.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                name: 'Água Verde Transfers',
                url: 'https://aguaverde.tur.br',
              },
              getOrganizationSchema(),
            ],
          }),
        }}
      />

      <Header />

      <main>
        {/* Hero */}
        <Hero />

        {/* Stats bar */}
        <section className="bg-[#1a5c38] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { value: '4.888+', label: 'Viagens realizadas' },
                { value: '89', label: 'Motoristas profissionais' },
                { value: '4.9/5', label: 'Avaliação média' },
                { value: '3', label: 'Idiomas atendidos' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl lg:text-4xl font-heading font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rotas */}
        <RotasGrid />

        {/* Por que escolher */}
        <section className="py-24 bg-[#fafbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
                Por que Água Verde?
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1a1a2e] mb-4">
                Experiência que faz a diferença
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Segurança garantida',
                  desc: 'Motoristas certificados, veículos revisados e rastreamento GPS em tempo real durante toda a viagem.',
                },
                {
                  icon: Clock,
                  title: 'Pontualidade absoluta',
                  desc: 'Monitoramos o status do seu voo em tempo real. Atraso? Não se preocupe, nosso motorista espera.',
                },
                {
                  icon: Globe,
                  title: 'Atendimento multilíngue',
                  desc: 'Comunicação em português, inglês e espanhol. Nossos motoristas são treinados para receber turistas de todo o mundo.',
                },
                {
                  icon: Car,
                  title: 'Frota de qualidade',
                  desc: 'Veículos novos, climatizados, com Wi-Fi e amplo espaço para bagagens. Conforto desde o primeiro minuto.',
                },
                {
                  icon: Headphones,
                  title: 'Suporte 24 horas',
                  desc: 'Nossa equipe está disponível a qualquer momento para resolver imprevistos e garantir sua tranquilidade.',
                },
                {
                  icon: Check,
                  title: 'Preço justo, sem surpresas',
                  desc: 'Orçamento transparente sem taxas ocultas. Você sabe o valor antes de confirmar sua reserva.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-6 bg-white rounded-2xl border border-[#1a5c38]/5 hover:border-[#1a5c38]/10 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-[#1a5c38]/10 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-[#1a5c38]" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-[#1a1a2e] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5a6570] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* App Diferencial */}
        <section className="py-24 bg-[#0d2e1c] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-[#27ae60]/20 text-[#27ae60] text-sm font-semibold rounded-full mb-6">
                  Tecnologia Exclusiva
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                  Acompanhe sua viagem em tempo real pelo app
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  A única empresa de transfer de Recife com app próprio. Veja exatamente onde seu motorista está, 
                  receba notificações quando ele estiver a caminho e avalie o serviço ao final — tudo pelo celular.
                </p>

                <div className="space-y-4 mb-10">
                  {[
                    { title: 'Rastreamento GPS ao vivo', desc: 'Veja o motorista no mapa em tempo real' },
                    { title: 'Notificações push', desc: 'Saiba quando o motorista saiu, chegou e iniciou a viagem' },
                    { title: 'Avaliação integrada', desc: 'Dê nota e comentário direto no app após o transfer' },
                    { title: 'Histórico de viagens', desc: 'Acesse todas as suas viagens e vouchers em um só lugar' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#27ae60]/20 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-[#27ae60]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-white/60">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm text-white/60">Disponível para:</span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/90">
                    iOS
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/90">
                    Android
                  </span>
                </div>
              </div>

              <div className="relative flex justify-center">
                <div className="relative w-64 sm:w-72 rounded-[2.5rem] border-[6px] border-[#1a1a2e] bg-[#1a1a2e] shadow-2xl shadow-black/40 overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1a1a2e] rounded-b-xl z-10" />
                  <Image
                    src="/images/app-screenshot.png"
                    alt="Tela real do app Água Verde mostrando acompanhamento da viagem"
                    width={320}
                    height={640}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <Depoimentos />

        {/* Orçamento Section */}
        <section id="orcamento" className="py-24 bg-[#fafbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left: Info */}
              <div className="lg:sticky lg:top-24">
                <span className="inline-block px-4 py-1.5 bg-[#27ae60]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
                  Orçamento Grátis
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1a1a2e] mb-6">
                  Solicite seu transfer em minutos
                </h2>
                <p className="text-lg text-[#5a6570] mb-8 leading-relaxed">
                  Preencha o formulário ao lado e receba seu orçamento personalizado em até 30 minutos 
                  via WhatsApp ou e-mail. Sem compromisso.
                </p>

                <div className="space-y-4">
                  {[
                    'Resposta em até 30 minutos',
                    'Orçamento sem compromisso',
                    'Atendimento em PT/EN/ES',
                    'Pagamento via Pix, cartão ou dinheiro',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#27ae60]/10 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-[#27ae60]" />
                      </div>
                      <span className="text-sm text-[#1a1a2e]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Form */}
              <FormOrcamento />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
