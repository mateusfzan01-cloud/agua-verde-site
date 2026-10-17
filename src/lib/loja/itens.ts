import type { ItemDoPedido } from './pedidos-tipos'
import type { Produto } from './tipos'

/** As pernas (ida, volta) de uma compra. Cada perna vira uma viagem depois do pagamento. */
export function montarItens(
  produto: Pick<Produto, 'tipo' | 'sentido' | 'origemPadrao' | 'destinoPadrao'>,
  agenda: { data: string; hora?: string; dataVolta?: string; horaVolta?: string },
  extras: { endereco?: string; vooNumero?: string; vooCompanhia?: string } = {},
): ItemDoPedido[] {
  const ehTransfer = produto.tipo === 'transfer'
  const itens: ItemDoPedido[] = [
    {
      ordem: 1,
      origem: produto.origemPadrao,
      destino: produto.destinoPadrao,
      dataIso: agenda.data,
      // Passeio: o horário é combinado depois da reserva.
      hora: ehTransfer ? (agenda.hora ?? null) : null,
      endereco: extras.endereco?.trim() || undefined,
      vooNumero: extras.vooNumero?.trim() || undefined,
      vooCompanhia: extras.vooCompanhia?.trim() || undefined,
    },
  ]
  if (ehTransfer && produto.sentido === 'ida_volta' && agenda.dataVolta) {
    itens.push({
      ordem: 2,
      origem: produto.destinoPadrao,
      destino: produto.origemPadrao,
      dataIso: agenda.dataVolta,
      hora: agenda.horaVolta ?? null,
      endereco: extras.endereco?.trim() || undefined,
    })
  }
  return itens
}
