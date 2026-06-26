'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Quanto tempo leva o transfer do aeroporto de Recife para Maragogi?',
    a: 'O percurso entre o Aeroporto Internacional do Recife (REC/Guararapes) e Maragogi tem aproximadamente 130 km, percorridos em média em 2 horas e 30 minutos pela BR-101 Sul, atravessando a fronteira de Pernambuco com Alagoas. Em alta temporada — verão, Carnaval e feriados prolongados — o tempo pode chegar a 3 horas. Nossa frota é totalmente climatizada e os motoristas conhecem os melhores trajetos.',
  },
  {
    q: 'Qual o preço do transfer aeroporto de Recife → Maragogi?',
    a: 'O transfer privado do aeroporto de Recife para Maragogi parte de R$ 580 para grupos de 1 a 3 passageiros, com veículo sedan ou SUV climatizado. Para grupos maiores (4 ou mais passageiros) ou van, entre em contato para um orçamento personalizado. Não há cobranças extras por bagagens padrão.',
  },
  {
    q: 'O motorista espera se o meu voo atrasar?',
    a: 'Sim. Monitoramos todos os voos em tempo real via rastreamento automatizado. Se houver atraso, o motorista é avisado automaticamente e aguarda no saguão de desembarque sem cobranças adicionais. Você não precisa fazer nada — cuidamos disso por você.',
  },
  {
    q: 'Maragogi fica em Pernambuco ou em Alagoas?',
    a: 'Maragogi fica no estado de Alagoas (AL), na fronteira com Pernambuco, a aproximadamente 130 km ao sul do aeroporto de Recife. É conhecida como o "Caribe brasileiro" pelas suas águas verde-turquesa e piscinas naturais formadas pelos recifes de corais — as famosas Galés, consideradas a segunda maior piscina natural do Brasil. O trajeto do aeroporto passa por Porto de Galinhas e percorre a BR-101 Sul até a divisa com Alagoas.',
  },
  {
    q: 'Posso contratar o transfer de volta (Maragogi → Aeroporto)?',
    a: 'Sim! Atendemos nos dois sentidos e também oferecemos o pacote combo (ida + volta) com condições especiais. Basta informar a data e o horário desejados. Recomendamos reservar com antecedência, especialmente em alta temporada, para garantir disponibilidade.',
  },
  {
    q: 'Vocês atendem turistas estrangeiros? Falam inglês e espanhol?',
    a: 'Sim! Atendemos passageiros de todo o mundo. Nossa equipe e muitos de nossos motoristas falam português, inglês e espanhol. Aceitamos pagamento em reais (dinheiro), PIX, cartão de crédito e débito. Para turistas argentinos, uruguaios, chilenos e europeus, a comunicação acontece sem barreiras durante todo o processo.',
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
