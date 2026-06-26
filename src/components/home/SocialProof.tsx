import { TripAdvisorBadge, InstagramLogo, GoogleReviewsLogo } from '@/components/shared/SocialIcons'

export function SocialProof() {
  return (
    <section className="py-16 bg-white border-y border-[#1a5c38]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-[#5a6570] uppercase tracking-wider">
            Reconhecimento e Presença Digital
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {/* TripAdvisor */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 group"
          >
            <TripAdvisorBadge className="w-36 h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs text-[#5a6570]">Certificado de Excelência</span>
          </a>

          {/* Google Reviews */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 group"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
              <GoogleReviewsLogo className="w-8 h-8" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-[#1a1a2e]">4.9</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#5a6570]">47 avaliações no Google</p>
              </div>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/aguaverdeviagens/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 group"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-xl text-white shadow-sm group-hover:shadow-md transition-shadow">
              <InstagramLogo className="w-8 h-8 text-white" />
              <div>
                <p className="text-sm font-bold">@aguaverdeviagens</p>
                <p className="text-xs text-white/80">Siga no Instagram</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
