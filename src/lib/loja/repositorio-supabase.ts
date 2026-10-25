/**
 * Repositório de pedidos no SUPABASE (tabelas criadas por supabase/migrations/*_loja_*).
 * Roda só no servidor, com a chave de serviço (que ignora o RLS): nada aqui vai para o navegador.
 *
 * Regras que este arquivo segura:
 *  - `salvar` nunca volta atrás no estado: o pagamento só vira "pago" por `confirmar_pedido` (SQL),
 *    e reembolso só por `reembolsar_pedido` (SQL, que também cancela as viagens que não começaram);
 *  - "expirado" só sai de "pendente_pagamento"; os dados da cobrança só mudam enquanto pendente;
 *  - evento repetido do gateway devolve false (duplicata), nunca é reprocessado.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { EventoDoGateway } from './pagamento/gateway'
import type { LinhaDePreco } from './precos'
import type {
  EventoDeAuditoria,
  ItemDoPedido,
  Pedido,
  RepositorioDePedidos,
  ResultadoDaConfirmacao,
  StatusDoPedido,
} from './pedidos-tipos'
import type { Idioma, Selecao, TipoProduto } from './tipos'

export interface LinhaItemDb {
  ordem: number
  origem: string
  destino: string
  data: string
  hora: string | null
  endereco: string | null
  voo_numero: string | null
  voo_companhia: string | null
  viagem_id: number | null
}

export interface LinhaPedidoDb {
  id: string
  numero: string
  token_acesso: string
  produto_slug: string
  tipo: string
  idioma: string
  moeda: string
  selecao: Selecao
  linhas: LinhaDePreco[]
  valor_total: number | string
  passageiro_nome: string
  passageiro_telefone: string
  passageiro_email: string
  passageiro_cpf: string | null
  observacoes: string | null
  status: string
  gateway: string | null
  gateway_ref: string | null
  gateway_payload: { pix?: string; url?: string } | null
  meio: 'pix' | 'cartao' | null
  consent_lgpd_em: string
  criado_em: string
  expira_em: string
  pago_em: string | null
  cancelado_em: string | null
  pedido_itens?: LinhaItemDb[]
}

/** O que guardamos da cobrança no banco: Pix copia e cola e/ou link de pagamento do cartão. */
export function payloadDaCobranca(p: Pick<Pedido, 'pix' | 'urlDePagamento'>): { pix?: string; url?: string } | null {
  if (!p.pix && !p.urlDePagamento) return null
  return { ...(p.pix ? { pix: p.pix } : {}), ...(p.urlDePagamento ? { url: p.urlDePagamento } : {}) }
}

const vazioParaUndefined = <T>(v: T | null | undefined): T | undefined => (v === null || v === undefined ? undefined : v)

/** Linha do banco -> Pedido da aplicação. `tokens` liga o id da viagem ao `token_cliente` (link de acompanhamento). */
export function paraPedido(r: LinhaPedidoDb, tokens: Map<number, string> = new Map()): Pedido {
  const itens: ItemDoPedido[] = [...(r.pedido_itens ?? [])]
    .sort((a, b) => a.ordem - b.ordem)
    .map((i) => ({
      ordem: i.ordem,
      origem: i.origem,
      destino: i.destino,
      dataIso: i.data,
      hora: i.hora ? i.hora.slice(0, 5) : null,
      endereco: vazioParaUndefined(i.endereco),
      vooNumero: vazioParaUndefined(i.voo_numero),
      vooCompanhia: vazioParaUndefined(i.voo_companhia),
      viagemId: vazioParaUndefined(i.viagem_id),
      viagemToken: i.viagem_id === null ? undefined : tokens.get(i.viagem_id),
    }))
  return {
    id: r.id,
    numero: r.numero,
    tokenAcesso: r.token_acesso,
    produtoSlug: r.produto_slug,
    tipo: r.tipo as TipoProduto,
    idioma: r.idioma as Idioma,
    moeda: 'BRL',
    selecao: r.selecao,
    linhas: r.linhas,
    valorTotal: Number(r.valor_total),
    passageiro: {
      nome: r.passageiro_nome,
      telefone: r.passageiro_telefone,
      email: r.passageiro_email,
      cpf: vazioParaUndefined(r.passageiro_cpf),
      observacoes: vazioParaUndefined(r.observacoes),
    },
    itens,
    status: r.status as StatusDoPedido,
    gateway: vazioParaUndefined(r.gateway),
    gatewayRef: vazioParaUndefined(r.gateway_ref),
    meio: vazioParaUndefined(r.meio),
    pix: vazioParaUndefined(r.gateway_payload?.pix),
    urlDePagamento: vazioParaUndefined(r.gateway_payload?.url),
    consentimentoEm: new Date(r.consent_lgpd_em),
    criadoEm: new Date(r.criado_em),
    expiraEm: new Date(r.expira_em),
    pagoEm: r.pago_em ? new Date(r.pago_em) : undefined,
    canceladoEm: r.cancelado_em ? new Date(r.cancelado_em) : undefined,
  }
}

/** Pedido novo -> linhas para inserir (pedido + pernas). */
export function paraLinhasDb(p: Pedido): { pedido: Record<string, unknown>; itens: Record<string, unknown>[] } {
  return {
    pedido: {
      id: p.id,
      numero: p.numero,
      token_acesso: p.tokenAcesso,
      produto_slug: p.produtoSlug,
      tipo: p.tipo,
      idioma: p.idioma,
      moeda: p.moeda,
      selecao: p.selecao,
      linhas: p.linhas,
      valor_total: p.valorTotal,
      passageiro_nome: p.passageiro.nome,
      passageiro_telefone: p.passageiro.telefone,
      passageiro_email: p.passageiro.email,
      passageiro_cpf: p.passageiro.cpf ?? null,
      observacoes: p.passageiro.observacoes ?? null,
      status: p.status,
      gateway: p.gateway ?? null,
      gateway_ref: p.gatewayRef ?? null,
      gateway_payload: payloadDaCobranca(p),
      meio: p.meio ?? null,
      consent_lgpd_em: p.consentimentoEm.toISOString(),
      criado_em: p.criadoEm.toISOString(),
      expira_em: p.expiraEm.toISOString(),
    },
    itens: p.itens.map((i) => ({
      pedido_id: p.id,
      ordem: i.ordem,
      origem: i.origem,
      destino: i.destino,
      data: i.dataIso,
      hora: i.hora,
      endereco: i.endereco ?? null,
      voo_numero: i.vooNumero ?? null,
      voo_companhia: i.vooCompanhia ?? null,
    })),
  }
}

export class ErroDoBanco extends Error {
  constructor(operacao: string, detalhe: string) {
    super(`Banco (${operacao}): ${detalhe}`)
  }
}

export class RepositorioSupabase implements RepositorioDePedidos {
  constructor(private readonly db: SupabaseClient) {}

  async proximoNumero(): Promise<string> {
    const { data, error } = await this.db.rpc('proximo_numero_pedido')
    if (error || typeof data !== 'string') throw new ErroDoBanco('proximo_numero_pedido', error?.message ?? 'resposta vazia')
    return data
  }

  async salvar(pedido: Pedido): Promise<void> {
    const { data: atual, error: erroLeitura } = await this.db.from('pedidos').select('id, status').eq('id', pedido.id).maybeSingle()
    if (erroLeitura) throw new ErroDoBanco('ler pedido', erroLeitura.message)

    if (!atual) {
      const { pedido: linha, itens } = paraLinhasDb(pedido)
      const { error } = await this.db.from('pedidos').insert(linha)
      if (error) throw new ErroDoBanco('criar pedido', error.message)
      const { error: erroItens } = await this.db.from('pedido_itens').insert(itens)
      if (erroItens) {
        await this.db.from('pedidos').delete().eq('id', pedido.id) // não deixa pedido sem pernas
        throw new ErroDoBanco('criar pernas do pedido', erroItens.message)
      }
      return
    }

    // Dados da cobrança: só enquanto pendente (nunca sobrescreve um pedido já pago por um objeto desatualizado).
    if (pedido.status === 'pendente_pagamento' && atual.status === 'pendente_pagamento') {
      const { error } = await this.db
        .from('pedidos')
        .update({
          gateway: pedido.gateway ?? null,
          gateway_ref: pedido.gatewayRef ?? null,
          gateway_payload: payloadDaCobranca(pedido),
          meio: pedido.meio ?? null,
        })
        .eq('id', pedido.id)
        .eq('status', 'pendente_pagamento')
      if (error) throw new ErroDoBanco('atualizar cobrança', error.message)
      return
    }

    if (pedido.status === 'expirado') {
      const { error } = await this.db.from('pedidos').update({ status: 'expirado' }).eq('id', pedido.id).eq('status', 'pendente_pagamento')
      if (error) throw new ErroDoBanco('expirar pedido', error.message)
      return
    }

    if (pedido.status === 'reembolsado' || pedido.status === 'cancelado') {
      const { data, error } = await this.db.rpc('reembolsar_pedido', { p_pedido_id: pedido.id, p_motivo: null })
      if (error) throw new ErroDoBanco('reembolsar pedido', error.message)
      const r = data as { ok: boolean; motivo?: string }
      if (!r.ok) throw new ErroDoBanco('reembolsar pedido', r.motivo ?? 'recusado')
    }
    // 'pago' só nasce em confirmar_pedido; nada a fazer aqui.
  }

  private async montar(linhas: LinhaPedidoDb[]): Promise<Pedido | null> {
    const r = linhas[0]
    if (!r) return null
    const ids = (r.pedido_itens ?? []).map((i) => i.viagem_id).filter((v): v is number => v !== null)
    const tokens = new Map<number, string>()
    if (ids.length > 0) {
      const { data, error } = await this.db.from('viagens').select('id, token_cliente').in('id', ids)
      if (error) throw new ErroDoBanco('ler viagens do pedido', error.message)
      for (const v of data ?? []) if (v.token_cliente) tokens.set(v.id as number, v.token_cliente as string)
    }
    return paraPedido(r, tokens)
  }

  async buscarPorId(id: string): Promise<Pedido | null> {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null
    const { data, error } = await this.db.from('pedidos').select('*, pedido_itens(*)').eq('id', id).limit(1)
    if (error) throw new ErroDoBanco('buscar pedido', error.message)
    return this.montar((data ?? []) as LinhaPedidoDb[])
  }

  async buscarPorToken(token: string): Promise<Pedido | null> {
    if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) return null
    const { data, error } = await this.db.from('pedidos').select('*, pedido_itens(*)').eq('token_acesso', token).limit(1)
    if (error) throw new ErroDoBanco('buscar pedido por token', error.message)
    return this.montar((data ?? []) as LinhaPedidoDb[])
  }

  async buscarPorNumeroEEmail(numero: string, email: string): Promise<Pedido | null> {
    const { data, error } = await this.db
      .from('pedidos')
      .select('*, pedido_itens(*)')
      .eq('numero', numero.trim().toUpperCase())
      .eq('passageiro_email', email.trim().toLowerCase())
      .limit(1)
    if (error) throw new ErroDoBanco('buscar pedido por número e e-mail', error.message)
    return this.montar((data ?? []) as LinhaPedidoDb[])
  }

  async registrarAuditoria(evento: EventoDeAuditoria): Promise<void> {
    const { error } = await this.db
      .from('pedido_eventos')
      .insert({ pedido_id: evento.pedidoId, tipo: evento.tipo, detalhes: evento.detalhes ?? null, criado_em: evento.em.toISOString() })
    if (error) throw new ErroDoBanco('auditoria do pedido', error.message)
  }

  async registrarEventoDoGateway(evento: EventoDoGateway): Promise<boolean> {
    const { error } = await this.db.from('gateway_eventos').insert({
      gateway: evento.gateway,
      evento_id: evento.eventoId,
      pedido_id: evento.pedidoId,
      gateway_ref: evento.gatewayRef,
      status: evento.status,
      payload: evento,
    })
    if (!error) return true
    if (error.code === '23505') return false // (gateway, evento_id) repetido: duplicata
    if (error.code === '23503') return false // pedido que não existe: aviso de outra origem, nada a fazer
    throw new ErroDoBanco('registrar evento do gateway', error.message)
  }

  async confirmarPedido(pedidoId: string, gatewayRef: string): Promise<ResultadoDaConfirmacao> {
    const { data, error } = await this.db.rpc('confirmar_pedido', { p_pedido_id: pedidoId, p_gateway_ref: gatewayRef })
    if (error) throw new ErroDoBanco('confirmar pedido', error.message)
    const r = data as { ok: boolean; ja_confirmado?: boolean; motivo?: string }
    if (r.ok) return { ok: true, jaConfirmado: Boolean(r.ja_confirmado) }
    return { ok: false, motivo: r.motivo as 'pedido_inexistente' | 'sem_evento_aprovado' | 'pedido_nao_pendente' }
  }
}
