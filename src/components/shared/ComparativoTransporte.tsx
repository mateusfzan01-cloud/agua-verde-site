type Props = { destino: string; precoAPartirDe: number }

const COLUNAS = ['Critério', 'Transfer privado Água Verde', 'Táxi do aeroporto', 'Uber / 99']

const linhas = (preco: number): string[][] => [
  [
    'Preço',
    `A partir de R$ ${preco}, combinado antes da viagem`,
    'Taxímetro, varia com trânsito e rota',
    'Tarifa dinâmica, varia com horário e demanda',
  ],
  ['Reserva antecipada', 'Sim, com confirmação pelo WhatsApp', 'Não, fila no desembarque', 'Só na hora, sujeito a disponibilidade'],
  ['Voo atrasado', 'Motorista acompanha o voo e ajusta o horário', 'Não se aplica', 'Não se aplica'],
  ['Cadeirinha infantil', 'Sob solicitação na reserva', 'Raramente disponível', 'Não disponível'],
  ['Idiomas', 'Português, inglês e espanhol', 'Geralmente só português', 'Geralmente só português'],
  ['Veículo', 'Sedan ou van climatizada, com espaço para bagagem', 'Varia', 'Varia'],
]

export function ComparativoTransporte({ destino, precoAPartirDe }: Props) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a1a2e] mb-4">
            Transfer privado, táxi ou Uber para {destino}?
          </h2>
          <p className="text-lg text-[#5a6570] max-w-2xl mx-auto">
            Comparação por critérios, para você decidir com calma. Não publicamos preços de terceiros.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#1a5c38]/10">
                {COLUNAS.map((coluna, i) => (
                  <th
                    key={coluna}
                    scope="col"
                    className={`px-4 py-3 font-semibold text-[#1a1a2e] ${i === 1 ? 'bg-[#1a5c38]/5' : ''}`}
                  >
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas(precoAPartirDe).map(([criterio, transfer, taxi, app]) => (
                <tr key={criterio} className="border-b border-[#1a5c38]/10">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-[#1a1a2e]">{criterio}</th>
                  <td className="px-4 py-3 bg-[#1a5c38]/5 font-semibold text-[#1a1a2e]">{transfer}</td>
                  <td className="px-4 py-3 text-[#5a6570]">{taxi}</td>
                  <td className="px-4 py-3 text-[#5a6570]">{app}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-[#5a6570]">As informações sobre táxi e aplicativos são gerais e podem variar.</p>
      </div>
    </section>
  )
}
