'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Quanto tempo leva o transfer do aeroporto de Recife para Praia de Carneiros?',
    a: 'O percurso entre o Aeroporto Internacional do Recife (REC/Guararapes) e Praia de Carneiros, em Tamandaré, tem aproximadamente 115 km percorridos em média em 1 hora e 45 minutos pela BR-101 Sul. Em alta temporada — Carnaval, feriados prolongados e verão — o tempo pode chegar a 2 horas. Nossa frota é totalmente climatizada e os motoristas conhecem os melhores trajetos.',
  },
  {
    q: 'Qual o preço do transfer aeroporto de Recife → Praia de Carneiros?',
    a: 'O transfer privado do aeroporto de Recife para Praia de Carneiros parte de R$ 420 para grupos de 1 a 3 passageiros, com veículo sedan ou SUV climatizado. Para grupos maiores (4 ou mais passageiros) ou van, entre em contato para um orçamento personalizado. Não há cobranças extras por bagagens padrão.',
  },
  {
    q: 'O motorista espera se o meu voo atrasar?',
    a: 'Sim. Monitoramos todos os voos em tempo real via rastreamento automatizado. Se houver atraso, o motorista é avisado automaticamente e aguarda no saguão de desembarque sem cobranças adicionais. Você não precisa fazer nada — cuidamos disso por você.',
  },
  {
    q: 'Praia de Carneiros fica onde exatamente? Fica próxima de Porto de Galinhas?',
    a: 'Praia de Carneiros fica no município de Tamandaré, a 115 km ao sul de Recife. Está a aproximadamente 50 km ao sul de Porto de Galinhas — ou seja, é um destino ainda mais tranquilo e menos frequentado. É uma ótima opção para quem quer privacidade, praias mais desertas e águas ainda mais calmas. Caso queira combinar uma passagem por Porto de Galinhas, isso também é possível mediante consulta.',
  },
  {
    q: 'Posso contratar o transfer de volta (Praia de Carneiros → Aeroporto)?',
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
