import { beforeEach, describe, expect, it } from 'vitest'
import { produtoPorSlug } from './catalogo'
import { dataMinimaDeReserva } from './datas'
import { criarPedido, MINUTOS_PARA_PAGAR, type EntradaDoPedido } from './pedidos'
import { cancelarPedido, estadoDoPedido, iniciarPagamento, pedirLinkDaReserva, processarWebhook, reenviarVoucher, type Dependencias } from './fluxo'
import { GatewaySimulado, CABECALHO_ASSINATURA, assinar } from './pagamento/simulado'
import { RepositorioEmMemoria } from './repositorio-memoria'
import type { Pedido } from './pedidos-tipos'

const agora = new Date('2026-12-01T12:00:00Z')
const maragogiIdaVolta = produtoPorSlug('aeroporto-recife-maragogi-ida-e-volta')!
const cityTour = produtoPorSlug('city-tour-recife-olinda')!

function entrada(over: Partial<EntradaDoPedido> = {}): EntradaDoPedido {
  return {
    produto: maragogiIdaVolta,
    idioma: 'es',
    selecao: { veiculos: { sedan_economico: 1 } },
    data: '2026-12-15',
    hora: '14:30',
    dataVolta: '2026-12-22',
    horaVolta: '10:00',
    passageiro: { nome: 'Lucía Fernández', telefone: '+54 9 11 1234-5678', email: 'Lucia@Exemplo.com', aceitouTermos: true, endereco: 'Pousada em Maragogi' },
    agora,
    ...over,
  }
}

let deps: Dependencias
let repo: RepositorioEmMemoria
let gateway: GatewaySimulado
const enviados: Pedido[] = []

beforeEach(() => {
  repo = new RepositorioEmMemoria()
  gateway = new GatewaySimulado()
  enviados.length = 0
  deps = { repo, gateway, periodosDeAltaTemporada: [], enviarLinkDaReserva: async (p) => void enviados.push(p) }
})

async function pedidoPendente(over: Partial<EntradaDoPedido> = {}): Promise<Pedido> {
  const r = await criarPedido(repo, entrada(over))
  if (!r.ok) throw new Error(`pedido recusado: ${r.erros.join(',')}`)
  return r.pedido
}

async function pagarPeloWebhook(pedido: Pedido) {
  const ini = await iniciarPagamento(deps, pedido.id, 'pix', agora)
  if (!ini.ok) throw new Error(ini.motivo)
  const aviso = gateway.simularPagamentoAprovado(ini.pedido.gatewayRef!)!
  const cab = { get: (n: string) => (n.toLowerCase() === CABECALHO_ASSINATURA ? aviso.assinatura : null) }
  return { aviso, cab, resposta: await processarWebhook(deps, aviso.corpo, cab, agora) }
}

describe('criarPedido', () => {
  it('cria pedido pendente com número, token longo, 2 pernas na ida e volta e total do veículo', async () => {
    const p = await pedidoPendente()
    expect(p.status).toBe('pendente_pagamento')
    expect(p.numero).toMatch(/^AV-\d{4}-000001$/)
    expect(p.tokenAcesso.length).toBeGreaterThanOrEqual(32)
    expect(p.valorTotal).toBe(740)
    expect(p.itens).toHaveLength(2)
    expect(p.itens[1]).toMatchObject({ origem: maragogiIdaVolta.destinoPadrao, destino: maragogiIdaVolta.origemPadrao, dataIso: '2026-12-22', hora: '10:00' })
    expect(p.passageiro.email).toBe('lucia@exemplo.com')
    expect(p.passageiro.telefone).toBe('+5491112345678')
    expect(p.expiraEm.getTime() - agora.getTime()).toBe(MINUTOS_PARA_PAGAR * 60_000)
  })

  it('passeio tem 1 perna e horário em aberto', async () => {
    const p = await pedidoPendente({ produto: cityTour, selecao: { veiculos: { sedan_executivo: 1 } }, data: '2026-12-17', hora: undefined, dataVolta: undefined, horaVolta: undefined })
    expect(p.itens).toHaveLength(1)
    expect(p.itens[0].hora).toBeNull()
    expect(p.valorTotal).toBe(550)
  })

  it('recusa data de hoje ou passada (mínimo: amanhã em Recife)', async () => {
    expect(dataMinimaDeReserva(agora)).toBe('2026-12-02')
    const r = await criarPedido(repo, entrada({ data: '2026-12-01' }))
    expect(r).toEqual({ ok: false, erros: ['data_no_passado'] })
  })

  it('recusa volta antes da ida, hora faltando e dados ruins do passageiro, tudo de uma vez', async () => {
    const r = await criarPedido(repo, entrada({ dataVolta: '2026-12-10', hora: undefined, passageiro: { nome: 'X', telefone: '1', email: 'x', aceitouTermos: false } }))
    expect(r.ok).toBe(false)
    expect(!r.ok && r.erros).toEqual(expect.arrayContaining(['volta_antes_da_ida', 'hora_invalida', 'nome', 'telefone', 'email', 'termos']))
  })

  it('recusa compra sem veículo e acima do limite', async () => {
    expect(await criarPedido(repo, entrada({ selecao: {} }))).toEqual({ ok: false, erros: ['nada_selecionado'] })
    expect(await criarPedido(repo, entrada({ selecao: { veiculos: { sedan_economico: 11 } } }))).toEqual({ ok: false, erros: ['acima_do_limite'] })
  })

  it('números dos pedidos são sequenciais e o token nunca se repete', async () => {
    const a = await pedidoPendente()
    const b = await pedidoPendente()
    expect(a.numero).not.toBe(b.numero)
    expect(a.tokenAcesso).not.toBe(b.tokenAcesso)
  })
})

describe('pagamento e confirmação (§4.7)', () => {
  it('webhook assinado confirma: pedido vira pago e cada perna ganha uma viagem', async () => {
    const p = await pedidoPendente()
    const { resposta } = await pagarPeloWebhook(p)
    expect(resposta).toEqual({ status: 200, corpo: 'ok' })
    const depois = (await repo.buscarPorId(p.id))!
    expect(depois.status).toBe('pago')
    expect(depois.pagoEm).toBeInstanceOf(Date)
    expect(depois.itens.map((i) => i.viagemId)).toEqual([9000, 9001])
  })

  it('assinatura errada: 401 e nada muda', async () => {
    const p = await pedidoPendente()
    const ini = await iniciarPagamento(deps, p.id, 'pix', agora)
    expect(ini.ok).toBe(true)
    const aviso = gateway.simularPagamentoAprovado(p.id ? `sim_${p.id}` : '')!
    const r = await processarWebhook(deps, aviso.corpo, { get: () => assinar('outro corpo') })
    expect(r).toEqual({ status: 401, corpo: 'assinatura_invalida' })
    const r2 = await processarWebhook(deps, aviso.corpo, { get: () => null })
    expect(r2.status).toBe(401)
    expect((await repo.buscarPorId(p.id))!.status).toBe('pendente_pagamento')
  })

  it('corpo alterado depois de assinado é recusado (a assinatura vale para o corpo cru)', async () => {
    const p = await pedidoPendente()
    await iniciarPagamento(deps, p.id, 'pix', agora)
    const aviso = gateway.simularPagamentoAprovado(`sim_${p.id}`)!
    const adulterado = aviso.corpo.replace('"aprovado"', '"aprovado" ')
    const r = await processarWebhook(deps, adulterado, { get: () => aviso.assinatura })
    expect(r.status).toBe(401)
  })

  it('evento repetido é ignorado e não cria viagem em dobro', async () => {
    const p = await pedidoPendente()
    const { aviso, cab } = await pagarPeloWebhook(p)
    const segunda = await processarWebhook(deps, aviso.corpo, cab)
    expect(segunda).toEqual({ status: 200, corpo: 'duplicado' })
    const depois = (await repo.buscarPorId(p.id))!
    expect(depois.itens.map((i) => i.viagemId)).toEqual([9000, 9001])
  })

  it('confirmarPedido sem evento aprovado gravado recusa', async () => {
    const p = await pedidoPendente()
    expect(await repo.confirmarPedido(p.id, `sim_${p.id}`)).toEqual({ ok: false, motivo: 'sem_evento_aprovado' })
    expect((await repo.buscarPorId(p.id))!.status).toBe('pendente_pagamento')
  })

  it('evento recusado ou de outro pedido não confirma', async () => {
    const p = await pedidoPendente()
    const outro = await pedidoPendente()
    await iniciarPagamento(deps, p.id, 'pix', agora)
    await repo.registrarEventoDoGateway({ eventoId: 'e1', gatewayRef: `sim_${p.id}`, pedidoId: p.id, status: 'recusado' })
    expect(await repo.confirmarPedido(p.id, `sim_${p.id}`)).toMatchObject({ ok: false })
    await repo.registrarEventoDoGateway({ eventoId: 'e2', gatewayRef: `sim_${p.id}`, pedidoId: outro.id, status: 'aprovado' })
    expect(await repo.confirmarPedido(p.id, `sim_${p.id}`)).toMatchObject({ ok: false })
  })

  it('página de sucesso é somente leitura: abrir/recarregar sem pagamento aprovado não gera viagem', async () => {
    const p = await pedidoPendente()
    await iniciarPagamento(deps, p.id, 'pix', agora)
    for (let i = 0; i < 3; i++) {
      const estado = await estadoDoPedido(deps, p.tokenAcesso, agora)
      expect(estado!.status).toBe('pendente_pagamento')
      expect(estado!.itens.every((it) => it.viagemId === undefined)).toBe(true)
    }
  })

  it('se o gateway já aprovou mas o webhook não chegou, a consulta confirma uma única vez', async () => {
    const p = await pedidoPendente()
    await iniciarPagamento(deps, p.id, 'pix', agora)
    gateway.simularPagamentoAprovado(`sim_${p.id}`) // gateway aprovou; webhook "se perdeu"
    const a = await estadoDoPedido(deps, p.tokenAcesso, agora)
    const b = await estadoDoPedido(deps, p.tokenAcesso, agora)
    expect(a!.status).toBe('pago')
    expect(b!.itens.map((i) => i.viagemId)).toEqual([9000, 9001])
  })

  it('pedido sem pagamento expira depois de 30 minutos e não cria nada', async () => {
    const p = await pedidoPendente()
    const tarde = new Date(agora.getTime() + 31 * 60_000)
    const estado = await estadoDoPedido(deps, p.tokenAcesso, tarde)
    expect(estado!.status).toBe('expirado')
    expect(await iniciarPagamento(deps, p.id, 'pix', tarde)).toMatchObject({ ok: false })
  })

  it('iniciar pagamento duas vezes reaproveita a mesma cobrança (idempotência)', async () => {
    const p = await pedidoPendente()
    const a = await iniciarPagamento(deps, p.id, 'pix', agora)
    const b = await iniciarPagamento(deps, p.id, 'pix', agora)
    expect(a.ok && b.ok && a.pedido.gatewayRef === b.pedido.gatewayRef).toBe(true)
  })
})

describe('cancelamento', () => {
  async function pedidoPago(over: Partial<EntradaDoPedido> = {}) {
    const p = await pedidoPendente(over)
    await pagarPeloWebhook(p)
    return p
  }

  it('arrependimento: até 48 h depois de pagar, reembolso na hora', async () => {
    const p = await pedidoPago()
    const r = await cancelarPedido(deps, p.tokenAcesso, new Date(agora.getTime() + 47 * 3_600_000))
    expect(r).toEqual({ ok: true, motivo: 'arrependimento' })
    expect((await repo.buscarPorId(p.id))!.status).toBe('reembolsado')
  })

  it('dentro do prazo normal (transfer, 24 h antes) também reembolsa', async () => {
    const p = await pedidoPago()
    const r = await cancelarPedido(deps, p.tokenAcesso, new Date('2026-12-14T12:00:00Z'))
    expect(r).toEqual({ ok: true, motivo: 'dentro_do_prazo' })
  })

  it('fora do prazo: não reembolsa sozinho', async () => {
    const p = await pedidoPago()
    const r = await cancelarPedido(deps, p.tokenAcesso, new Date('2026-12-14T20:00:00Z'))
    expect(r).toEqual({ ok: false, motivo: 'fora_do_prazo' })
    expect((await repo.buscarPorId(p.id))!.status).toBe('pago')
  })

  it('passeio: 48 h antes (sem alta temporada cadastrada)', async () => {
    const p = await pedidoPago({ produto: cityTour, selecao: { veiculos: { sedan_executivo: 1 } }, data: '2026-12-17', hora: undefined, dataVolta: undefined, horaVolta: undefined })
    expect(await cancelarPedido(deps, p.tokenAcesso, new Date('2026-12-15T10:00:00Z'))).toEqual({ ok: true, motivo: 'dentro_do_prazo' })
  })

  it('não cancela duas vezes nem pedido que não está pago', async () => {
    const pendente = await pedidoPendente()
    expect(await cancelarPedido(deps, pendente.tokenAcesso, agora)).toEqual({ ok: false, motivo: 'nao_esta_pago' })
    const pago = await pedidoPago()
    await cancelarPedido(deps, pago.tokenAcesso, agora)
    expect(await cancelarPedido(deps, pago.tokenAcesso, agora)).toEqual({ ok: false, motivo: 'nao_esta_pago' })
  })

  it('token errado não acha pedido', async () => {
    expect(await cancelarPedido(deps, 'token-que-nao-existe', agora)).toEqual({ ok: false, motivo: 'nao_encontrado' })
  })
})

describe('cobrança e voucher', () => {
  it('guarda o Pix "copia e cola" no pedido para a tela de pagamento', async () => {
    const p = await pedidoPendente()
    const r = await iniciarPagamento(deps, p.id, 'pix', agora)
    expect(r.ok && r.pix).toMatch(/^00020126SIMULADO/)
    const lido = (await repo.buscarPorId(p.id))!
    expect(lido.meio).toBe('pix')
    expect(lido.pix).toBe(r.ok ? r.pix : '')
  })
  it('cartão não tem Pix guardado', async () => {
    const p = await pedidoPendente()
    await iniciarPagamento(deps, p.id, 'cartao', agora)
    expect((await repo.buscarPorId(p.id))!.pix).toBeUndefined()
  })
  it('reenviar voucher só funciona para pedido pago', async () => {
    const p = await pedidoPendente()
    expect(await reenviarVoucher(deps, p.tokenAcesso)).toBe(false)
    await pagarPeloWebhook(p)
    expect(await reenviarVoucher(deps, p.tokenAcesso)).toBe(true)
    expect(enviados).toHaveLength(1)
    expect(await reenviarVoucher(deps, 'token-ruim')).toBe(false)
  })
})

describe('minha reserva', () => {
  it('reenvia o link só quando número e e-mail batem, sem devolver dados', async () => {
    const p = await pedidoPendente()
    await pedirLinkDaReserva(deps, p.numero, 'outra@pessoa.com')
    expect(enviados).toHaveLength(0)
    await pedirLinkDaReserva(deps, 'AV-2026-999999', 'lucia@exemplo.com')
    expect(enviados).toHaveLength(0)
    const retorno = await pedirLinkDaReserva(deps, p.numero.toLowerCase(), ' LUCIA@exemplo.com ')
    expect(retorno).toBeUndefined()
    expect(enviados).toHaveLength(1)
  })
})
