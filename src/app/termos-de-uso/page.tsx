import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'

export const metadata: Metadata = {
  title: 'Termos de Uso | Água Verde Transfers',
  description:
    'Termos e Condições de Uso da Água Verde Transfers. Conheça as regras para contratação de transfer privado em Recife, Porto de Galinhas e região.',
  alternates: { canonical: '/termos-de-uso' },
}

export default function TermosUsoPage() {
  return (
    <>
      <Header />

      <main className="pt-16 lg:pt-20">
        <section className="py-16 bg-[#fafbfa] border-b border-[#1a5c38]/8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
              Jurídico
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-[#1a1a2e] mb-4">
              Termos de Uso
            </h1>
            <p className="text-[#5a6570]">Última atualização: maio de 2026</p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-headings:font-heading prose-headings:text-[#1a1a2e] prose-p:text-[#5a6570] prose-p:leading-relaxed prose-a:text-[#1a5c38]">
            <h2>1. Aceitação dos termos</h2>
            <p>
              Ao utilizar os serviços da Água Verde Transfers, você concorda com os
              presentes Termos de Uso. Caso não concorde, não utilize nossos serviços.
              Estes termos se aplicam a todas as contratações de transfer privado
              realizadas através do site aguaverde.tur.br, WhatsApp ou qualquer outro
              canal de atendimento da empresa.
            </p>

            <h2>2. Descrição do serviço</h2>
            <p>
              A Água Verde Transfers oferece serviço de transporte privado ponto a
              ponto (transfer) entre locais previamente acordados. O serviço é prestado
              por motoristas parceiros em veículos próprios ou da frota da empresa,
              conforme disponibilidade e categoria contratada.
            </p>

            <h2>3. Reservas e pagamento</h2>
            <ul>
              <li>A reserva é confirmada mediante pagamento, que pode ser realizado via Pix, cartão de crédito/débito ou dinheiro, conforme combinado no momento do orçamento.</li>
              <li>O valor do serviço é informado previamente no orçamento e pode variar conforme distância, número de passageiros, tipo de veículo e data da viagem.</li>
              <li>Cancelamentos devem ser comunicados com pelo menos 24 horas de antecedência para reembolso integral. Cancelamentos com menos de 24 horas podem estar sujeitos a taxa de até 50% do valor.</li>
            </ul>

            <h2>4. Obrigações do passageiro</h2>
            <ul>
              <li>Fornecer informações corretas sobre voo, local de embarque e número de passageiros.</li>
              <li>Informar bagagens especiais, equipamentos esportivos ou necessidades específicas no momento da reserva.</li>
              <li>Estar no local de embarque no horário combinado. Atrasos superiores a 30 minutos sem comunicação prévia podem ser considerados no-show.</li>
              <li>Utilizar cinto de segurança durante todo o trajeto.</li>
            </ul>

            <h2>5. Obrigações da Água Verde</h2>
            <ul>
              <li>Disponibilizar veículo em boas condições, limpo, climatizado e com manutenção em dia.</li>
              <li>Designar motorista devidamente habilitado, identificado e treinado.</li>
              <li>Monitorar voos contratados para ajustar o horário de embarque em caso de atrasos aéreos.</li>
              <li>Comunicar prontamente qualquer imprevisto que possa afetar a viagem.</li>
            </ul>

            <h2>6. Atrasos de voo</h2>
            <p>
              Para passageiros que contrataram o serviço com monitoramento de voo (padrão
              para embarques no Aeroporto do Recife), atrasos aéreos são acompanhados
              automaticamente. O motorista ajusta o horário de embarque sem custo adicional
              para atrasos razoáveis. Atrasos excepcionais (superiores a 4 horas) serão
              tratados caso a caso.
            </p>

            <h2>7. Bagagens</h2>
            <p>
              Cada passageiro tem direito a 1 mala grande (até 23 kg) e 1 bagagem de mão.
              Excesso de bagagem deve ser informado na reserva e pode implicar em veículo
              de categoria superior ou custo adicional. A empresa não se responsabiliza
              por objetos de valor deixados no veículo após o desembarque.
            </p>

            <h2>8. Responsabilidade e força maior</h2>
            <p>
              A Água Verde Transfers não se responsabiliza por atrasos causados por
              condições de tráfego excepcionais, bloqueios de estradas, fenômenos naturais,
              ou outras situações de força maior. Em tais casos, a empresa se compromete a
              manter o passageiro informado e buscar alternativas viáveis.
            </p>

            <h2>9. Avaliações e feedback</h2>
            <p>
              Ao final de cada viagem, incentivamos os passageiros a avaliar o serviço.
              As avaliações nos ajudam a manter o padrão de qualidade e a identificar
              oportunidades de melhoria.
            </p>

            <h2>10. Disposições gerais</h2>
            <ul>
              <li>Estes termos são regidos pelas leis da República Federativa do Brasil.</li>
              <li>Qualquer disputa será dirimida no foro da comarca de Recife, Estado de Pernambuco.</li>
              <li>A Água Verde Transfers reserva-se o direito de modificar estes termos a qualquer momento, publicando a versão atualizada em seu site.</li>
              <li>A tolerância de eventual descumprimento de qualquer cláusula não constitui renúncia ou novação.</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
