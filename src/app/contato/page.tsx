import type { Metadata } from 'next'
import { MessageCircle, Mail, MapPin, Clock, Phone, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'
import { ContactForm } from './ContactForm'
import { getOrganizationSchema } from '@/lib/json-ld'

export const metadata: Metadata = {
  title: 'Contato | Água Verde Transfers — Recife e Região',
  description:
    'Entre em contato com a Água Verde Transfers. WhatsApp, e-mail ou formulário — respondemos em até 30 minutos. Transfer privado em Recife, Porto de Galinhas e Praia de Carneiros.',
  alternates: { canonical: '/contato' },
}

const canais = [
  {
    icon: MessageCircle,
    titulo: 'WhatsApp',
    valor: '+55 81 9947-3200',
    desc: 'Resposta em até 30 minutos',
    href: 'https://wa.me/558199473200',
    cor: '#25D366',
    cta: 'Iniciar conversa',
  },
  {
    icon: Mail,
    titulo: 'E-mail',
    valor: 'contato@aguaverde.tur.br',
    desc: 'Para contratos e documentos',
    href: 'mailto:contato@aguaverde.tur.br',
    cor: '#1a5c38',
    cta: 'Enviar e-mail',
  },
  {
    icon: MapPin,
    titulo: 'Endereço',
    valor: 'R. Jonathas de Vasconcelos, 13 — Sala 7 e 8',
    desc: 'Boa Viagem, Recife — PE, 51021-140 · CNPJ 17.427.292/0001-4',
    href: 'https://maps.google.com/?q=Rua+Jonathas+de+Vasconcelos+13+Boa+Viagem+Recife+PE',
    cor: '#d4a853',
    cta: 'Ver no mapa',
  },
]

const horarios = [
  { dia: 'Segunda a sexta', hora: '06h às 23h' },
  { dia: 'Sábados', hora: '06h às 23h' },
  { dia: 'Domingos e feriados', hora: '06h às 23h' },
  { dia: 'Atendimento urgente', hora: '24 horas via WhatsApp' },
]

export default function ContatoPage() {
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
                  { '@type': 'ListItem', position: 2, name: 'Contato', item: 'https://aguaverde.tur.br/contato' },
                ],
              },
            ],
          }),
        }}
      />

      <Header />

      <main className="pt-16 lg:pt-20">
        {/* ── HEADER DA PÁGINA ──────────────────────────────────── */}
        <section className="py-16 bg-[#fafbfa] border-b border-[#1a5c38]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
              Fale conosco
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-[#1a1a2e] mb-4">
              Como podemos ajudar?
            </h1>
            <p className="text-lg text-[#5a6570] max-w-xl mx-auto">
              Escolha o canal mais conveniente. Nossa equipe responde em português,
              inglês e espanhol.
            </p>
          </div>
        </section>

        {/* ── CANAIS ────────────────────────────────────────────── */}
        <section className="py-12 bg-white border-b border-[#1a5c38]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {canais.map((canal) => (
                <div
                  key={canal.titulo}
                  className="flex items-start gap-4 p-6 bg-[#fafbfa] rounded-2xl border border-[#1a5c38]/5"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${canal.cor}18` }}
                  >
                    <canal.icon className="w-6 h-6" style={{ color: canal.cor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#5a6570] font-medium mb-0.5">{canal.titulo}</p>
                    <p className="font-heading font-semibold text-[#1a1a2e] text-sm">{canal.valor}</p>
                    <p className="text-xs text-[#5a6570] mt-0.5">{canal.desc}</p>
                    {canal.href && canal.cta && (
                      <a
                        href={canal.href}
                        target={canal.href.startsWith('http') ? '_blank' : undefined}
                        rel={canal.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1 mt-3 text-xs font-semibold transition-colors"
                        style={{ color: canal.cor }}
                      >
                        {canal.cta}
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORM + INFO ───────────────────────────────────────── */}
        <section className="py-24 bg-[#fafbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

              {/* Info lateral */}
              <div className="lg:col-span-2 space-y-6">
                {/* Horários */}
                <div className="bg-white rounded-2xl p-6 border border-[#1a5c38]/8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#1a5c38]/10 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#1a5c38]" />
                    </div>
                    <h3 className="font-heading font-semibold text-[#1a1a2e]">
                      Horários de atendimento
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {horarios.map((h) => (
                      <li key={h.dia} className="flex items-center justify-between text-sm">
                        <span className="text-[#5a6570]">{h.dia}</span>
                        <span className="font-medium text-[#1a1a2e]">{h.hora}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WhatsApp CTA */}
                <div className="bg-[#0d2e1c] rounded-2xl p-6 text-white">
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    Prefere falar agora?
                  </h3>
                  <p className="text-white/70 text-sm mb-5">
                    O WhatsApp é o canal mais rápido. Respondemos em até 30 minutos durante
                    o horário de atendimento.
                  </p>
                  <a
                    href="https://wa.me/558199473200"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir WhatsApp
                  </a>
                </div>

                {/* Destinos atendidos */}
                <div className="bg-white rounded-2xl p-6 border border-[#1a5c38]/8">
                  <h3 className="font-heading font-semibold text-[#1a1a2e] mb-4">
                    Destinos atendidos
                  </h3>
                  <ul className="space-y-2">
                    {[
                      { destino: 'Porto de Galinhas', href: '/transfer-porto-de-galinhas' },
                      { destino: 'Praia de Carneiros', href: '/transfer-praia-de-carneiros' },
                      { destino: 'Maragogi (AL)', href: '/transfer-maragogi' },
                      { destino: 'Recife — hotéis e eventos', href: null },
                      { destino: 'Aeroporto REC (Guararapes)', href: null },
                    ].map((item) => (
                      <li key={item.destino} className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-[#1a5c38] shrink-0" />
                        {item.href ? (
                          <a href={item.href} className="text-[#1a5c38] hover:underline font-medium">
                            {item.destino}
                          </a>
                        ) : (
                          <span className="text-[#5a6570]">{item.destino}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Formulário */}
              <div className="lg:col-span-3">
                <div className="mb-6">
                  <h2 className="text-2xl font-heading font-bold text-[#1a1a2e] mb-2">
                    Envie uma mensagem
                  </h2>
                  <p className="text-[#5a6570] text-sm">
                    Preencha o formulário e retornaremos em breve. Para orçamentos,{' '}
                    <a href="/#orcamento" className="text-[#1a5c38] font-medium hover:underline">
                      use o formulário de orçamento
                    </a>{' '}
                    para uma resposta mais rápida.
                  </p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
