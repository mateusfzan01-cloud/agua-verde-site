'use server'

/**
 * Ações do servidor da loja (checkout, pagamento, cancelamento).
 * Hoje usam o repositório em memória e o gateway simulado (lib/loja/servicos.ts).
 * O preço NUNCA vem do navegador: é recalculado aqui pelo catálogo.
 */
import { redirect as irPara } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { redirect } from '@/i18n/config'
import { routing, type Locale } from '@/i18n/routing'
import { lerQuery } from '@/lib/loja/checkout-url'
import { produtoPorSlug } from '@/lib/loja/catalogo'
import { cancelarPedido, iniciarPagamento, pedirLinkDaReserva, processarWebhook, reenviarVoucher, type ResultadoDoCancelamento } from '@/lib/loja/fluxo'
import { criarPedido } from '@/lib/loja/pedidos'
import type { MeioDePagamento } from '@/lib/loja/pagamento/gateway'
import { CABECALHO_ASSINATURA } from '@/lib/loja/pagamento/simulado'
import { dependencias, gatewaySimulado, repositorio } from '@/lib/loja/servicos'

function idioma(valor: FormDataEntryValue | string | null): Locale {
  return typeof valor === 'string' && hasLocale(routing.locales, valor) ? valor : routing.defaultLocale
}

const texto = (f: FormData, nome: string) => (typeof f.get(nome) === 'string' ? (f.get(nome) as string) : '')

/**
 * Fim do checkout: cria o pedido (preço recalculado pelo catálogo) e abre a cobrança no meio escolhido
 * (Pix ou cartão); depois leva para a tela de pagamento.
 */
export async function finalizarCompraAction(formData: FormData): Promise<{ erros: string[] }> {
  const locale = idioma(formData.get('locale'))
  const escolha = lerQuery(new URLSearchParams(texto(formData, 'query')))
  const produto = escolha ? produtoPorSlug(escolha.slug) : undefined
  if (!escolha || !produto) return { erros: ['pedido_invalido'] }
  const meio: MeioDePagamento = texto(formData, 'meio') === 'cartao' ? 'cartao' : 'pix'

  const deps = dependencias()
  const resultado = await criarPedido(deps.repo, {
    produto,
    idioma: locale,
    selecao: escolha.selecao,
    data: escolha.data,
    hora: escolha.hora || undefined,
    dataVolta: escolha.dataVolta || undefined,
    horaVolta: escolha.horaVolta || undefined,
    passageiro: {
      nome: texto(formData, 'nome'),
      telefone: texto(formData, 'telefone'),
      email: texto(formData, 'email'),
      cpf: texto(formData, 'cpf'),
      endereco: texto(formData, 'endereco'),
      vooNumero: texto(formData, 'vooNumero'),
      vooCompanhia: texto(formData, 'vooCompanhia'),
      observacoes: texto(formData, 'observacoes'),
      aceitouTermos: formData.get('termos') === 'on',
    },
  })
  if (!resultado.ok) return { erros: resultado.erros }

  const cobranca = await iniciarPagamento(deps, resultado.pedido.id, meio)
  if (!cobranca.ok) return { erros: ['pedido_invalido'] }
  // Cartão: o cliente paga na página segura do gateway (volta para /checkout/<pedido>, que mostra o resultado).
  if (meio === 'cartao' && cobranca.pedido.urlDePagamento) irPara(cobranca.pedido.urlDePagamento)
  redirect({ href: `/checkout/${resultado.pedido.id}`, locale })
  return { erros: [] }
}

/** Só existe na simulação: faz de conta que o gateway avisou "pago" (assinado, como o real). */
export async function simularPagamentoAction(pedidoId: string, localeEntrada: string): Promise<{ ok: boolean }> {
  const locale = idioma(localeEntrada)
  const deps = dependencias()
  if (deps.gateway.nome !== 'simulado' || process.env.LOJA_PERMITE_SIMULACAO === 'false') return { ok: false }
  const pedido = await deps.repo.buscarPorId(pedidoId)
  if (!pedido?.gatewayRef) return { ok: false }
  const aviso = gatewaySimulado().simularPagamentoAprovado(pedido.gatewayRef)
  if (!aviso) return { ok: false }
  const cabecalhos = new Headers({ [CABECALHO_ASSINATURA]: aviso.assinatura })
  await processarWebhook(deps, aviso.corpo, cabecalhos)
  redirect({ href: `/reserva/${pedido.tokenAcesso}`, locale })
  return { ok: true }
}

export async function cancelarReservaAction(token: string): Promise<ResultadoDoCancelamento> {
  return cancelarPedido(dependencias(), token)
}

export async function reenviarVoucherAction(token: string): Promise<boolean> {
  return reenviarVoucher(dependencias(), token)
}

export async function pedirLinkAction(formData: FormData): Promise<void> {
  await pedirLinkDaReserva(dependencias(), texto(formData, 'numero'), texto(formData, 'email'))
}
