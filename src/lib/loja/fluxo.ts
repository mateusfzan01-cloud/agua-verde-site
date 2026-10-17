/**
 * Fluxo do pedido (plano §4.7). Tudo passa pela interface do gateway e pelo
 * repositório, então o mesmo código serve para a simulação e para o Mercado Pago.
 *
 * Regras que os testes garantem:
 *  - só o webhook (assinatura conferida no corpo cru) ou a consulta direta ao
 *    gateway confirmam um pedido; abrir ou recarregar a página de sucesso não;
 *  - evento repetido nunca é reprocessado;
 *  - confirmar duas vezes não cria viagem em dobro.
 */
import { avaliarCancelamento, HORA_REFERENCIA_PASSEIO, type PeriodoAltaTemporada } from './politicas'
import type { GatewayDePagamento, MeioDePagamento } from './pagamento/gateway'
import type { Pedido, RepositorioDePedidos } from './pedidos-tipos'

export interface Dependencias {
  repo: RepositorioDePedidos
  gateway: GatewayDePagamento
  /** Aviso ao passageiro (e-mail/WhatsApp). Na simulação só registra. */
  enviarLinkDaReserva?: (pedido: Pedido) => Promise<void>
  periodosDeAltaTemporada?: PeriodoAltaTemporada[]
}

export async function iniciarPagamento(
  { repo, gateway }: Dependencias,
  pedidoId: string,
  meio: MeioDePagamento,
  agora = new Date(),
): Promise<
  | { ok: true; pedido: Pedido; pix?: string; urlDePagamento?: string }
  | { ok: false; motivo: 'nao_encontrado' | 'nao_esta_pendente' | 'expirado' }
> {
  const pedido = await repo.buscarPorId(pedidoId)
  if (!pedido) return { ok: false, motivo: 'nao_encontrado' }
  if (pedido.status !== 'pendente_pagamento') return { ok: false, motivo: 'nao_esta_pendente' }
  if (agora > pedido.expiraEm) {
    pedido.status = 'expirado'
    await repo.salvar(pedido)
    return { ok: false, motivo: 'expirado' }
  }

  const cobranca = await gateway.criarCobranca({
    pedidoId: pedido.id,
    valor: pedido.valorTotal,
    meio,
    descricao: `Água Verde ${pedido.numero}`,
    pagador: { nome: pedido.passageiro.nome, email: pedido.passageiro.email, telefone: pedido.passageiro.telefone, cpf: pedido.passageiro.cpf },
  })
  pedido.gateway = gateway.nome
  pedido.gatewayRef = cobranca.gatewayRef
  pedido.meio = meio
  await repo.salvar(pedido)
  await repo.registrarAuditoria({ pedidoId: pedido.id, tipo: 'cobranca_criada', detalhes: { meio, gatewayRef: cobranca.gatewayRef }, em: agora })
  return { ok: true, pedido, pix: cobranca.pix?.copiaECola, urlDePagamento: cobranca.urlDePagamento }
}

/**
 * Recebe o aviso do gateway. `corpoCru` é o texto exato da requisição
 * (await req.text()): a assinatura é conferida nele, antes de qualquer JSON.parse.
 * Só responde 2xx depois de gravar.
 */
export async function processarWebhook(
  { repo, gateway }: Dependencias,
  corpoCru: string,
  cabecalhos: { get(nome: string): string | null },
  agora = new Date(),
): Promise<{ status: 200 | 401; corpo: 'ok' | 'duplicado' | 'assinatura_invalida' }> {
  const evento = gateway.validarWebhook(corpoCru, cabecalhos)
  if (!evento) return { status: 401, corpo: 'assinatura_invalida' }

  const novo = await repo.registrarEventoDoGateway(evento)
  if (!novo) return { status: 200, corpo: 'duplicado' }

  if (evento.status === 'aprovado') await repo.confirmarPedido(evento.pedidoId, evento.gatewayRef, agora)
  return { status: 200, corpo: 'ok' }
}

/**
 * Estado atual do pedido para a página da reserva. Somente leitura, com uma
 * exceção: se ainda está pendente, pergunta ao gateway; só se ele responder
 * "aprovado" é que grava o evento e confirma (mesma função do webhook).
 */
export async function estadoDoPedido(
  { repo, gateway }: Dependencias,
  tokenAcesso: string,
  agora = new Date(),
): Promise<Pedido | null> {
  let pedido = await repo.buscarPorToken(tokenAcesso)
  if (!pedido) return null

  if (pedido.status === 'pendente_pagamento' && pedido.gatewayRef) {
    const consulta = await gateway.consultarPagamento(pedido.gatewayRef)
    if (consulta.status === 'aprovado') {
      await repo.registrarEventoDoGateway({
        eventoId: `consulta_${pedido.gatewayRef}_aprovado`,
        gatewayRef: pedido.gatewayRef,
        pedidoId: pedido.id,
        status: 'aprovado',
        valor: consulta.valor,
      })
      await repo.confirmarPedido(pedido.id, pedido.gatewayRef, agora)
      pedido = (await repo.buscarPorId(pedido.id)) ?? pedido
    }
  }

  if (pedido.status === 'pendente_pagamento' && agora > pedido.expiraEm) {
    pedido.status = 'expirado'
    await repo.salvar(pedido)
    await repo.registrarAuditoria({ pedidoId: pedido.id, tipo: 'expirado', em: agora })
  }
  return pedido
}

export type ResultadoDoCancelamento =
  | { ok: true; motivo: 'arrependimento' | 'dentro_do_prazo' }
  | { ok: false; motivo: 'nao_encontrado' | 'nao_esta_pago' | 'fora_do_prazo' | 'servico_ja_comecou' | 'falha_no_reembolso' }

export async function cancelarPedido(
  deps: Dependencias,
  tokenAcesso: string,
  agora = new Date(),
): Promise<ResultadoDoCancelamento> {
  const { repo, gateway } = deps
  const pedido = await repo.buscarPorToken(tokenAcesso)
  if (!pedido) return { ok: false, motivo: 'nao_encontrado' }
  if (pedido.status !== 'pago' || !pedido.pagoEm || !pedido.gatewayRef) return { ok: false, motivo: 'nao_esta_pago' }

  // O prazo conta a partir do primeiro trecho (a ida).
  const primeiro = pedido.itens[0]
  const decisao = avaliarCancelamento({
    tipo: pedido.tipo,
    dataIso: primeiro.dataIso,
    hora: primeiro.hora ?? HORA_REFERENCIA_PASSEIO,
    pagoEm: pedido.pagoEm,
    agora,
    periodos: deps.periodosDeAltaTemporada,
  })
  if (!decisao.reembolsoAutomatico) {
    return { ok: false, motivo: decisao.motivo === 'servico_ja_comecou' ? 'servico_ja_comecou' : 'fora_do_prazo' }
  }

  const reembolso = await gateway.reembolsar(pedido.gatewayRef)
  if (!reembolso.ok) return { ok: false, motivo: 'falha_no_reembolso' }

  pedido.status = 'reembolsado'
  pedido.canceladoEm = agora
  await repo.salvar(pedido)
  await repo.registrarAuditoria({ pedidoId: pedido.id, tipo: 'reembolsado', detalhes: { motivo: decisao.motivo }, em: agora })
  return { ok: true, motivo: decisao.motivo === 'arrependimento' ? 'arrependimento' : 'dentro_do_prazo' }
}

/**
 * "Minha reserva": número + e-mail. Não devolve dados; se os dois baterem,
 * reenvia o link secreto. A resposta é sempre a mesma, para ninguém descobrir
 * quais números existem.
 */
export async function pedirLinkDaReserva(deps: Dependencias, numero: string, email: string): Promise<void> {
  const pedido = await deps.repo.buscarPorNumeroEEmail(numero, email)
  if (pedido && deps.enviarLinkDaReserva) await deps.enviarLinkDaReserva(pedido)
}
