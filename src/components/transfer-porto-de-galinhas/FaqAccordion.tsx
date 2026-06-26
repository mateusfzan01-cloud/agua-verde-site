'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Quanto tempo leva o transfer do aeroporto de Recife para Porto de Galinhas?',
    a: 'O percurso entre o Aeroporto Internacional do Recife (REC/Guararapes) e Porto de Galinhas tem aproximadamente 70 km, percorridos em média em 1 hora e 15 minutos pela BR-101 Sul. Em alta temporada — verão, Carnaval e feriados prolongados — o tempo pode ser de até 1h30 devido ao maior fluxo. Nossa frota é totalmente climatizada e os motoristas conhecem os melhores trajetos alternativos.',
  },
  {
    q: 'Qual o preço do transfer aeroporto de Recife → Porto de Galinhas?',
    a: 'O transfer privado do aeroporto de Recife para Porto de Galinhas parte de R$ 350 para grupos de 1 a 3 passageiros, com veículo sedan ou SUV climatizado. Para grupos maiores (4 ou mais passageiros), van ou veículo premium, entre em contato para um orçamento personalizado. Não há cobrança extra por bagagens padrão.',
  },
  {
    q: 'O motorista espera se o meu voo atrasar?',
    a: 'Sim, absolutamente. Monitoramos todos os voos em tempo real via rastreamento de voo automatizado. Se houver atraso, nosso motorista é avisado automaticamente e aguarda sua chegada no saguão de desembarque sem cobranças adicionais. Você não precisa avisar — cuidamos disso por você.',
  },
  {
    q: 'Posso contratar o transfer de volta (Porto de Galinhas → Aeroporto)?',
    a: 'Sim! Oferecemos o transfer nos dois sentidos e também o pacote combo (ida + volta) com condições especiais. Basta informar a data e o horário desejados para a volta. Recomendamos reservar com antecedência, especialmente em alta temporada, para garantir disponibilidade.',
  },
  {
    q: 'Qual é a melhor opção de transporte entre Recife e Porto de Galinhas?',
    a: 'Para quem chega de avião com bagagens, o transfer privado é a melhor opção: conforto porta a porta, sem esperas em filas, motorista que conhece seu voo e veículo exclusivo para o seu grupo. As alternativas incluem ônibus executivo (saída da rodoviária, sem deslocamento porta a porta), van compartilhada (horários fixos, paradas intermediárias) e aluguel de carro (envolve pedágios, combustível e estacionamento em PDG). O custo-benefício do transfer privado se destaca especialmente para famílias e grupos.',
  },
  {
    q: 'Vocês atendem turistas estrangeiros? Falam inglês e espanhol?',
    a: 'Sim! Atendemos passageiros de todo o mundo. Nossa equipe de atendimento e muitos de nossos motoristas falam português, inglês e espanhol. Aceitamos pagamento em dinheiro (reais), PIX, cartão de crédito e débito. Para turistas argentinos, uruguaios, chilenos e europeus, oferecemos comunicação facilitada em todo o processo de reserva e durante a viagem.',
  },
]

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className="border border-[#1a5c38]/10 rounded-2xl overflow-hidden bg-white transition-shadow hover:shadow-md"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-[#fafbfa] transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-heading font-semibold text-[#1a1a2e] text-sm sm:text-base leading-snug">
                {faq.q}
              </span>
              <span className="shrink-0 w-7 h-7 rounded-full bg-[#1a5c38]/10 flex items-center justify-center text-[#1a5c38] mt-0.5">
                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>

            {isOpen && (
              <div className="px-6 pb-5 border-t border-[#1a5c38]/5">
                <p className="pt-4 text-sm text-[#5a6570] leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
