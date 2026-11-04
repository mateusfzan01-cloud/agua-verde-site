import { Check } from 'lucide-react'
import { FormOrcamento } from '@/components/home/FormOrcamento'
import { Reveal } from '@/components/shared/Reveal'

// Seção "Solicite seu transfer" da home antiga (só em português por enquanto). O formulário
// é o mesmo da home antiga e grava em orcamentos_site.
export function OrcamentoDaHome() {
  return (
    <section id="orcamento" className="grid scroll-mt-24 items-start gap-10 lg:grid-cols-2">
      <Reveal className="lg:sticky lg:top-24">
        <span className="mb-4 inline-block rounded-full bg-[#27ae60]/10 px-3 py-1 text-xs font-semibold text-[#1a5c38]">
          Orçamento grátis
        </span>
        <h2 className="mb-4 font-heading text-2xl font-semibold sm:text-3xl">Prefere um orçamento personalizado?</h2>
        <p className="mb-6 text-[15px] leading-relaxed text-[#5a6570]">
          Grupo grande, várias paradas ou uma rota fora da lista? Preencha o formulário e receba seu orçamento em até
          30 minutos via WhatsApp ou e-mail. Sem compromisso.
        </p>
        <div className="grid gap-3">
          {['Resposta em até 30 minutos', 'Orçamento sem compromisso', 'Atendimento em PT/EN/ES', 'Pagamento via Pix, cartão ou dinheiro'].map(
            (item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#27ae60]/10">
                  <Check className="h-3.5 w-3.5 text-[#27ae60]" aria-hidden="true" />
                </span>
                <span className="text-sm">{item}</span>
              </div>
            )
          )}
        </div>
      </Reveal>
      <Reveal delay={150}>
        <FormOrcamento />
      </Reveal>
    </section>
  )
}
