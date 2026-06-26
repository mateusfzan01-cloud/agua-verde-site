import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Água Verde Transfers',
  description:
    'Política de Privacidade da Água Verde Transfers. Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD.',
  alternates: { canonical: '/politica-de-privacidade' },
}

export default function PoliticaPrivacidadePage() {
  return (
    <>
      <Header />

      <main className="pt-16 lg:pt-20">
        <section className="py-16 bg-[#fafbfa] border-b border-[#1a5c38]/8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
              LGPD
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-[#1a1a2e] mb-4">
              Política de Privacidade
            </h1>
            <p className="text-[#5a6570]">Última atualização: maio de 2026</p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-headings:font-heading prose-headings:text-[#1a1a2e] prose-p:text-[#5a6570] prose-p:leading-relaxed prose-a:text-[#1a5c38]">
            <h2>1. Introdução</h2>
            <p>
              A Água Verde Transfers leva a sua privacidade a sério. Esta política descreve
              como coletamos, usamos, armazenamos e protegemos as informações fornecidas
              por você ao utilizar nossos serviços, em conformidade com a Lei Geral de
              Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </p>

            <h2>2. Dados coletados</h2>
            <p>
              Para fornecer nossos serviços de transfer privado, podemos coletar as seguintes
              informações:
            </p>
            <ul>
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Número de telefone (WhatsApp)</li>
              <li>Informações do voo (número, data, horário)</li>
              <li>Local de embarque e desembarque</li>
              <li>Número de passageiros</li>
            </ul>

            <h2>3. Finalidade do tratamento</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul>
              <li>Realizar a reserva e prestação do serviço de transfer</li>
              <li>Enviar comunicações relacionadas à sua viagem</li>
              <li>Emitir comprovantes e documentos fiscais</li>
              <li>Melhorar nossos serviços com base em avaliações e feedback</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>

            <h2>4. Compartilhamento de dados</h2>
            <p>
              Seus dados não são vendidos ou compartilhados com terceiros para fins
              comerciais. O compartilhamento ocorre apenas:
            </p>
            <ul>
              <li>Com motoristas parceiros, para execução do serviço contratado</li>
              <li>Com plataformas de pagamento, quando aplicável</li>
              <li>Mediante ordem judicial ou obrigação legal</li>
            </ul>

            <h2>5. Armazenamento e segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros com criptografia e controles
              de acesso restrito. Mantemos medidas técnicas e organizacionais para proteger
              suas informações contra acessos não autorizados, perda ou alteração.
            </p>

            <h2>6. Retenção de dados</h2>
            <p>
              Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as
              finalidades descritas nesta política, ou conforme exigido por lei. Após esse
              período, os dados são anonimizados ou excluídos com segurança.
            </p>

            <h2>7. Seus direitos (LGPD)</h2>
            <p>
              Nos termos da LGPD, você tem direito a:
            </p>
            <ul>
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a exclusão de dados desnecessários ou tratados em desconformidade</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos dados</li>
            </ul>

            <h2>8. Cookies</h2>
            <p>
              Nosso site utiliza cookies essenciais para funcionamento e cookies analíticos
              para entender como os visitantes interagem com o site. Você pode desabilitar
              cookies nas configurações do seu navegador.
            </p>

            <h2>9. Contato do Encarregado (DPO)</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre
              em contato:
            </p>
            <ul>
              <li>E-mail: contato@aguaverde.tur.br</li>
              <li>WhatsApp: +55 81 9947-3200</li>
            </ul>

            <h2>10. Alterações nesta política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. Recomendamos revisá-la
              com frequência. A data da última atualização estará sempre indicada no
              topo desta página.
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
