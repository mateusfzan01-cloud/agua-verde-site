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

/** Um provedor por forma de pagamento (decisão 31): o Pix e o cartão podem ser empresas diferentes. */
export interface Gateways {
  pix: GatewayDePagamento
  cartao: GatewayDePagamento
}

export interface Dependencias {
  repo: RepositorioDePedidos
  gateways: Gateways
  /** Aviso ao passageiro (e-mail/WhatsApp). Na simulação só registra. */
  enviarLinkDaReserva?: (pedido: Pedido) => Promise<void>
  periodosDeAltaTemporada?: PeriodoAltaTemporada[]
}

/**
 * O provedor que cobrou (ou vai cobrar) este pedido. Depois de `iniciarPagamento` o pedido lembra o nome
 * (`pedido.gateway`), e consulta e reembolso voltam sempre a ele, mesmo que a configuração mude depois.
 * Devolve undefined se o pedido foi cobrado por um provedor que não está mais ligado.
 */
export function gatewayDoPedido({ gateways }: Dependencias, pedido: Pick<Pedido, 'gateway' | 'meio'>): GatewayDePagamento | undefined {
  if (pedido.gateway) return [gateways.pix, gateways.cartao].find((g) => g.nome === pedido.gateway)
  return pedido.meio ? gateways[pedido.meio] : undefined
}

export async function iniciarPagamento(
  { repo, gateways }: Dependencias,
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

  const gateway = gateways[meio]
  const cobranca = await gateway.criarCobranca({
    pedidoId: pedido.id,
    valor: pedido.valorTotal,
    meio,
    descricao: `Água Verde ${pedido.numero}`,
    expiraEm: pedido.expiraEm,
    idioma: pedido.idioma,
    pagador: { nome: pedido.passageiro.nome, email: pedido.passageiro.email, telefone: pedido.passageiro.telefone, cpf: pedido.passageiro.cpf },
  })
  pedido.gateway = gateway.nome
  pedido.gatewayRef = cobranca.gatewayRef
  pedido.meio = meio
  pedido.pix = cobranca.pix?.copiaECola
  pedido.urlDePagamento = cobranca.urlDePagamento?.startsWith('https://') ? cobranca.urlDePagamento : undefined
  await repo.salvar(pedido)
  await repo.registrarAuditoria({ pedidoId: pedido.id, tipo: 'cobranca_criada', detalhes: { meio, gatewayRef: cobranca.gatewayRef }, em: agora })
  return { ok: true, pedido, pix: cobranca.pix?.copiaECola, urlDePagamento: cobranca.urlDePagamento }
}

/**
 * Recebe o aviso de UM provedor (cada um tem a sua rota de webhook, que diz qual é). `corpoCru` é o
 * texto exato da requisição (await req.text()): a assinatura é conferida nele, antes de qualquer
 * JSON.parse. Só responde 2xx depois de gravar.
 *
 * Pagamento aprovado com valor diferente do pedido NÃO confirma: fica registrado
 * (evento + auditoria) para a equipe conferir.
 */
export async function processarWebhook(
  { repo }: Dependencias,
  gateway: GatewayDePagamento,
  corpoCru: string,
  cabecalhos: { get(nome: string): string | null },
  agora = new Date(),
  url?: URL,
): Promise<{ status: 200 | 401; corpo: 'ok' | 'duplicado' | 'ignorado' | 'valor_divergente' | 'provedor_divergente' | 'assinatura_invalida' }> {
  const validado = await gateway.validarWebhook(corpoCru, cabecalhos, url)
  if (!validado) return { status: 401, corpo: 'assinatura_invalida' }
  if (validado === 'ignorar') return { status: 200, corpo: 'ignorado' }
  // O nome vem da rota que recebeu o aviso, nunca do corpo: é ele que separa os ids de cada provedor.
  const evento = { ...validado, gateway: gateway.nome }

  const novo = await repo.registrarEventoDoGateway(evento)
  if (!novo) return { status: 200, corpo: 'duplicado' }

  // Um aviso só vale para pedido cobrado pelo MESMO provedor: o aviso de um (por exemplo, o simulado)
  // nunca paga nem reembolsa um pedido do outro. Fica registrado para a equipe ver.
  const pedido = await repo.buscarPorId(evento.pedidoId)
  if (pedido && pedido.gateway && pedido.gateway !== gateway.nome) {
    await repo.registrarAuditoria({
      pedidoId: pedido.id,
      tipo: 'provedor_divergente',
      detalhes: { avisoDe: gateway.nome, pedidoCobradoPor: pedido.gateway, eventoId: evento.eventoId, gatewayRef: evento.gatewayRef },
      em: agora,
    })
    return { status: 200, corpo: 'provedor_divergente' }
  }

  if (evento.status === 'aprovado') {
    if (pedido && evento.valor !== undefined && Math.abs(evento.valor - pedido.valorTotal) > 0.005) {
      await repo.registrarAuditoria({
        pedidoId: pedido.id,
        tipo: 'valor_divergente',
        detalhes: { pago: evento.valor, esperado: pedido.valorTotal, gatewayRef: evento.gatewayRef },
        em: agora,
      })
      return { status: 200, corpo: 'valor_divergente' }
    }
    await repo.confirmarPedido(evento.pedidoId, evento.gatewayRef, agora)
  } else if (evento.status === 'reembolsado') {
    // Reembolso feito direto no painel do gateway: o pedido acompanha (e as viagens são canceladas).
    if (pedido && pedido.status === 'pago') {
      pedido.status = 'reembolsado'
      pedido.canceladoEm = agora
      await repo.salvar(pedido)
      await repo.registrarAuditoria({ pedidoId: pedido.id, tipo: 'reembolsado', detalhes: { origem: 'gateway' }, em: agora })
    }
  }
  return { status: 200, corpo: 'ok' }
}

/**
 * Estado atual do pedido para a página da reserva. Somente leitura, com uma
 * exceção: se ainda está pendente, pergunta ao gateway; só se ele responder
 * "aprovado" é que grava o evento e confirma (mesma função do webhook).
 */
export async function estadoDoPedido(
  deps: Dependencias,
  tokenAcesso: string,
  agora = new Date(),
): Promise<Pedido | null> {
  const { repo } = deps
  let pedido = await repo.buscarPorToken(tokenAcesso)
  if (!pedido) return null

  // Expirado também conta: pagamento que cai depois do prazo é honrado.
  // Pergunta ao provedor que abriu a cobrança; se ele não está mais ligado, a página fica só na leitura.
  const gateway = gatewayDoPedido(deps, pedido)
  if (gateway && (pedido.status === 'pendente_pagamento' || pedido.status === 'expirado') && pedido.gatewayRef) {
    const consulta = await gateway.consultarPagamento(pedido.gatewayRef)
    if (consulta.status === 'aprovado') {
      const ref = consulta.gatewayRef ?? pedido.gatewayRef
      await repo.registrarEventoDoGateway({
        gateway: gateway.nome,
        eventoId: `consulta_${ref}_aprovado`,
        gatewayRef: ref,
        pedidoId: pedido.id,
        status: 'aprovado',
        valor: consulta.valor,
      })
      if (consulta.valor === undefined || Math.abs(consulta.valor - pedido.valorTotal) <= 0.005) {
        await repo.confirmarPedido(pedido.id, ref, agora)
      } else {
        await repo.registrarAuditoria({ pedidoId: pedido.id, tipo: 'valor_divergente', detalhes: { pago: consulta.valor, esperado: pedido.valorTotal, gatewayRef: ref }, em: agora })
      }
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
  const { repo } = deps
  const pedido = await repo.buscarPorToken(tokenAcesso)
  if (!pedido) return { ok: false, motivo: 'nao_encontrado' }
  if (pedido.status !== 'pago' || !pedido.pagoEm || !pedido.gatewayRef) return { ok: false, motivo: 'nao_esta_pago' }
  // O reembolso volta pelo provedor que cobrou; se ele não está mais ligado, a equipe resolve pelo painel.
  const gateway = gatewayDoPedido(deps, pedido)
  if (!gateway) return { ok: false, motivo: 'falha_no_reembolso' }

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

/** Reenvia o voucher e o link da reserva (botão "Reenviar voucher"). Só para pedido pago. */
export async function reenviarVoucher(deps: Dependencias, tokenAcesso: string): Promise<boolean> {
  const pedido = await deps.repo.buscarPorToken(tokenAcesso)
  if (!pedido || pedido.status !== 'pago' || !deps.enviarLinkDaReserva) return false
  await deps.enviarLinkDaReserva(pedido)
  return true
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
