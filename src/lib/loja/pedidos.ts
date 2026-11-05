import { dataMinimaDeReserva, validarAgenda, type ErroDeAgenda } from './datas'
import { validarPassageiro, type CampoComErro, type DadosDoPassageiro } from './contato'
import { novoIdDePedido, novoTokenDeAcesso } from './repositorio-memoria'
import { calcularPreco, type ErroDePreco } from './precos'
import type { Idioma, Produto, Selecao } from './tipos'
import { montarItens } from './itens'
import type { Pedido, RepositorioDePedidos } from './pedidos-tipos'

/** Quanto tempo o cliente tem para pagar o Pix antes do pedido expirar (§4.5). */
export const MINUTOS_PARA_PAGAR = 30

export type ErroDoPedido = ErroDePreco | CampoComErro | ErroDeAgenda

export interface EntradaDoPedido {
  produto: Produto
  idioma: Idioma
  selecao: Selecao
  data: string
  hora?: string
  /** Só nos transfers de ida e volta. */
  dataVolta?: string
  horaVolta?: string
  passageiro: DadosDoPassageiro
  /** Relógio injetável (testes). */
  agora?: Date
}

export async function criarPedido(
  repo: RepositorioDePedidos,
  entrada: EntradaDoPedido,
): Promise<{ ok: true; pedido: Pedido } | { ok: false; erros: ErroDoPedido[] }> {
  const { produto, idioma, selecao, passageiro } = entrada
  const agora = entrada.agora ?? new Date()
  const erros: ErroDoPedido[] = []

  const preco = calcularPreco(produto, selecao)
  if (!preco.ok) erros.push(preco.erro)

  erros.push(...validarAgenda({ tipo: produto.tipo, sentido: produto.sentido, data: entrada.data, hora: entrada.hora, dataVolta: entrada.dataVolta, horaVolta: entrada.horaVolta }, agora))

  const contato = validarPassageiro(passageiro)
  if (!contato.ok) erros.push(...contato.erros)

  if (erros.length > 0 || !preco.ok || !contato.ok) return { ok: false, erros: [...new Set(erros)] }

  const itens = montarItens(
    produto,
    { data: entrada.data, hora: entrada.hora, dataVolta: entrada.dataVolta, horaVolta: entrada.horaVolta },
    { endereco: passageiro.endereco, vooNumero: passageiro.vooNumero, vooCompanhia: passageiro.vooCompanhia },
  )

  const pedido: Pedido = {
    id: novoIdDePedido(),
    numero: await repo.proximoNumero(),
    tokenAcesso: novoTokenDeAcesso(),
    produtoSlug: produto.slug,
    tipo: produto.tipo,
    idioma,
    moeda: 'BRL',
    selecao,
    linhas: preco.linhas,
    valorTotal: preco.total,
    passageiro: {
      nome: passageiro.nome.trim(),
      telefone: contato.telefoneE164,
      email: passageiro.email.trim().toLowerCase(),
      cpf: passageiro.cpf?.replace(/\D/g, '') || undefined,
      observacoes: passageiro.observacoes?.trim() || undefined,
    },
    itens,
    status: 'pendente_pagamento',
    consentimentoEm: agora,
    criadoEm: agora,
    expiraEm: new Date(agora.getTime() + MINUTOS_PARA_PAGAR * 60_000),
  }
  await repo.salvar(pedido)
  await repo.registrarAuditoria({ pedidoId: pedido.id, tipo: 'criado', detalhes: { valorTotal: pedido.valorTotal }, em: agora })
  return { ok: true, pedido }
}
