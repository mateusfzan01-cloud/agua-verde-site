import Image from 'next/image'
import { MapPin, ArrowRight, Star, Shield, Clock, Car } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2940&auto=format&fit=crop"
          alt="Porto de Galinhas, Pernambuco"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d2e1c]/95 via-[#0d2e1c]/70 to-[#0d2e1c]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e1c]/60 via-transparent to-[#0d2e1c]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <Star className="w-4 h-4 text-[#d4a853] fill-[#d4a853]" />
            <span className="text-sm font-medium text-white/90">4.9 de 5 — 47 avaliações verificadas</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-white leading-[1.1] mb-6">
            Sua viagem começa{' '}
            <span className="text-[#d4a853]">com tranquilidade</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-xl">
            Transfer privado de qualidade no Recife, Porto de Galinhas, Maragogi e região. 
            Motoristas profissionais, frota nova e atendimento em 3 idiomas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
            <a
              href="#orcamento"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#27ae60] text-white font-semibold rounded-full hover:bg-[#27ae60]/90 transition-all hover:scale-[1.02] shadow-lg shadow-[#27ae60]/20"
            >
              Solicitar Orçamento
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="https://wa.me/558199473200"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all"
            >
              Falar no WhatsApp
            </a>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, label: 'Motoristas certificados', desc: 'Treinados e verificados' },
              { icon: Clock, label: 'Pontualidade garantida', desc: 'Acompanhamos seu voo' },
              { icon: Car, label: 'Frota nova', desc: 'Ar-condicionado e Wi-Fi' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
              >
                <item.icon className="w-5 h-5 text-[#d4a853] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs tracking-widest uppercase">Rolar</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </div>
    </section>
  )
}
