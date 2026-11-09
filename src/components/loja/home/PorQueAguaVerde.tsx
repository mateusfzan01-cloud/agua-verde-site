import { Check, Clock, Car, Globe, Headphones, Shield } from 'lucide-react'
import { Reveal } from '@/components/shared/Reveal'

// Seção "Por que Água Verde?" da home antiga, trazida para a home da loja (só em português
// por enquanto). Texto igual ao da home antiga, exceto a promessa de "rastreamento GPS em
// tempo real", que o link de acompanhamento ainda não oferece.
const itens = [
  {
    icon: Shield,
    title: 'Segurança garantida',
    desc: 'Motoristas certificados, veículos revisados e acompanhamento da viagem por link durante toda a viagem.',
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
]

/** `children` entra depois dos diferenciais (na home: contador de viagens e exemplo do acompanhamento). */
export function PorQueAguaVerde({ children }: { children?: React.ReactNode }) {
  return (
    <section className="grid gap-6">
      <Reveal className="grid justify-items-center gap-2 text-center">
        <span className="rounded-full bg-[#1a5c38]/10 px-3 py-1 text-xs font-semibold text-[#1a5c38]">Por que Água Verde?</span>
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Experiência que faz a diferença</h2>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((item, index) => (
          <Reveal key={item.title} delay={(index % 3) * 120}>
            <div className="h-full rounded-2xl border border-[#1a5c38]/5 bg-white p-6 transition-all hover:border-[#1a5c38]/10 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5c38]/10">
                <item.icon className="h-6 w-6 text-[#1a5c38]" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[#5a6570]">{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
      {children}
    </section>
  )
}
