import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'
import { TripAdvisorLogo, InstagramLogo } from '@/components/shared/SocialIcons'

export function Footer() {
  return (
    <footer id="contato" className="bg-[#0d2e1c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image
                src="/images/logo-agua-verde.png"
                alt="Água Verde Transfers"
                width={200}
                height={80}
                className="w-40 lg:w-48 h-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Transfer privado de qualidade no Recife, Porto de Galinhas e região. 
              Sua viagem começa com tranquilidade.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.tripadvisor.com.br/Attraction_Review-g304560-d12087015-Reviews-Uluwatour_Viagens_Receptivos-Recife_State_of_Pernambuco.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#34E0A1] transition-colors"
                aria-label="TripAdvisor"
              >
                <TripAdvisorLogo className="w-7 h-7" />
              </a>
              <a
                href="https://www.instagram.com/aguaverdeviagens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <InstagramLogo className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Destinos */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Destinos</h4>
            <ul className="space-y-3">
              {[
                { label: 'Transfer Porto de Galinhas', href: '/transfer-porto-de-galinhas' },
                { label: 'Transfer Praia de Carneiros', href: '/transfer-praia-de-carneiros' },
                { label: 'Transfer para Maragogi', href: null },
                { label: 'Aeroporto do Recife (REC)', href: null },
              ].map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-white/70 hover:text-[#d4a853] transition-colors">
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-sm text-white/50">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Empresa</h4>
            <ul className="space-y-3">
              {[
                { label: 'Quem Somos', href: '/quem-somos' },
                { label: 'Contato', href: '/contato' },
                { label: 'Acompanhar Viagem', href: '/acompanhar' },
                { label: 'Solicitar Orçamento', href: '/#orcamento' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-white/70 hover:text-[#d4a853] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">Contato</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/558199473200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-[#d4a853] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +55 81 9947-3200
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@aguaverde.tur.br"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-[#d4a853] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contato@aguaverde.tur.br
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <MapPin className="w-4 h-4" />
                Recife, PE — Brasil
              </li>
              <li>
                <a
                  href="https://www.instagram.com/aguaverdeviagens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-[#d4a853] transition-colors"
                >
                  <InstagramLogo className="w-4 h-4" />
                  @aguaverdeviagens
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © 2026 Água Verde Transfers. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="/politica-de-privacidade" className="text-xs text-white/50 hover:text-white/80 transition-colors">
              Política de Privacidade
            </a>
            <a href="/termos-de-uso" className="text-xs text-white/50 hover:text-white/80 transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
