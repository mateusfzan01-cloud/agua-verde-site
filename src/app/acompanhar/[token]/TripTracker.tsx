'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2, Clock, Car, XCircle, MapPin,
  Calendar, MessageCircle, ArrowRight, Loader2,
} from 'lucide-react'
import { supabase, type Viagem, type StatusViagem } from '@/lib/supabase'

interface Props {
  token: string
}

type Estado = 'carregando' | 'encontrado' | 'nao_encontrado' | 'erro'

const statusConfig: Record<string, { label: string; cor: string; icon: typeof CheckCircle2 }> = {
  pendente:     { label: 'Aguardando confirmação', cor: '#d4a853', icon: Clock },
  confirmada:   { label: 'Transfer confirmado',    cor: '#1a5c38', icon: CheckCircle2 },
  a_caminho:    { label: 'Motorista a caminho',    cor: '#2563eb', icon: Car },
  em_andamento: { label: 'Em viagem',              cor: '#27ae60', icon: Car },
  concluida:    { label: 'Viagem concluída',       cor: '#1a5c38', icon: CheckCircle2 },
  cancelada:    { label: 'Cancelada',              cor: '#dc2626', icon: XCircle },
}

function getStatusConfig(status: StatusViagem) {
  return statusConfig[status] ?? { label: status, cor: '#5a6570', icon: Clock }
}

function formatDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function primeiroNome(nome: string) {
  return nome.split(' ')[0]
}

export function TripTracker({ token }: Props) {
  const [estado, setEstado] = useState<Estado>('carregando')
  const [viagem, setViagem] = useState<Viagem | null>(null)

  useEffect(() => {
    async function buscar() {
      try {
        const { data, error } = await supabase
          .from('viagens')
          .select('*')
          .eq('token_cliente', token)
          .single()

        if (error || !data) {
          setEstado('nao_encontrado')
          return
        }

        setViagem(data as Viagem)
        setEstado('encontrado')
      } catch {
        setEstado('erro')
      }
    }

    buscar()
  }, [token])

  /* ── Carregando ─────────────────────────────────────────── */
  if (estado === 'carregando') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#5a6570]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1a5c38]" />
        <p className="text-sm">Buscando sua viagem...</p>
      </div>
    )
  }

  /* ── Não encontrado ──────────────────────────────────────── */
  if (estado === 'nao_encontrado' || estado === 'erro') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 bg-[#dc2626]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-[#dc2626]" />
        </div>
        <h2 className="text-xl font-heading font-bold text-[#1a1a2e] mb-2">
          {estado === 'erro' ? 'Erro ao buscar viagem' : 'Voucher não encontrado'}
        </h2>
        <p className="text-[#5a6570] text-sm mb-6">
          {estado === 'erro'
            ? 'Houve um problema ao conectar. Tente novamente em instantes.'
            : 'O código informado não corresponde a nenhuma viagem. Verifique o link ou entre em contato conosco.'}
        </p>
        <a
          href="https://wa.me/558199473200"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a5c38] text-white font-semibold rounded-full hover:bg-[#27ae60] transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Falar no WhatsApp
        </a>
      </div>
    )
  }

  /* ── Encontrado ──────────────────────────────────────────── */
  if (!viagem) return null

  const sc = getStatusConfig(viagem.status)
  const StatusIcon = sc.icon

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      {/* Status badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold mb-8"
        style={{ backgroundColor: sc.cor }}
      >
        <StatusIcon className="w-4 h-4" />
        {sc.label}
      </div>

      {/* Saudação */}
      <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#1a1a2e] mb-8">
        Olá, {primeiroNome(viagem.passageiro_nome)}! 👋
      </h2>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-[#1a5c38]/10 shadow-sm overflow-hidden mb-6">
        {/* Rota */}
        <div className="p-6 border-b border-[#1a5c38]/8">
          <p className="text-xs text-[#5a6570] font-medium mb-3">Seu transfer</p>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1a5c38]" />
              <div className="w-0.5 h-8 bg-[#1a5c38]/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#d4a853]" />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <p className="text-xs text-[#5a6570]">Origem</p>
                <p className="font-semibold text-[#1a1a2e] text-sm">{viagem.origem}</p>
              </div>
              <div>
                <p className="text-xs text-[#5a6570]">Destino</p>
                <p className="font-semibold text-[#1a1a2e] text-sm">{viagem.destino}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data/hora */}
        <div className="flex items-center gap-3 p-5 border-b border-[#1a5c38]/8">
          <div className="w-9 h-9 bg-[#1a5c38]/8 rounded-lg flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-[#1a5c38]" />
          </div>
          <div>
            <p className="text-xs text-[#5a6570]">Data e hora</p>
            <p className="text-sm font-medium text-[#1a1a2e] capitalize">
              {formatDataHora(viagem.data_hora)}
            </p>
          </div>
        </div>

        {/* Reserva */}
        {viagem.numero_reserva && (
          <div className="flex items-center gap-3 p-5">
            <div className="w-9 h-9 bg-[#1a5c38]/8 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#1a5c38]" />
            </div>
            <div>
              <p className="text-xs text-[#5a6570]">Número da reserva</p>
              <p className="text-sm font-mono font-medium text-[#1a1a2e]">{viagem.numero_reserva}</p>
            </div>
          </div>
        )}
      </div>

      {/* Linha do tempo de status */}
      <div className="bg-[#fafbfa] rounded-2xl border border-[#1a5c38]/8 p-6 mb-6">
        <p className="text-xs font-semibold text-[#5a6570] uppercase tracking-wider mb-5">
          Situação da viagem
        </p>
        <div className="space-y-4">
          {[
            { key: 'confirmada', label: 'Transfer confirmado' },
            { key: 'a_caminho',  label: 'Motorista a caminho' },
            { key: 'em_andamento', label: 'Em viagem' },
            { key: 'concluida', label: 'Viagem concluída' },
          ].map((etapa, i, arr) => {
            const statuses: StatusViagem[] = ['pendente', 'confirmada', 'a_caminho', 'em_andamento', 'concluida']
            const etapaIdx  = statuses.indexOf(etapa.key)
            const atualIdx  = statuses.indexOf(viagem.status)
            const concluida = atualIdx > etapaIdx
            const atual     = atualIdx === etapaIdx
            const isPendente = viagem.status === 'cancelada'

            return (
              <div key={etapa.key} className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                  {i < arr.length - 1 && (
                    <span className="absolute top-7 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#1a5c38]/15" />
                  )}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isPendente
                        ? 'bg-[#5a6570]/10 text-[#5a6570]'
                        : concluida || atual
                        ? 'bg-[#1a5c38] text-white'
                        : 'bg-[#1a5c38]/10 text-[#5a6570]'
                    }`}
                  >
                    {concluida ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                </div>
                <span
                  className={`text-sm ${
                    atual
                      ? 'font-semibold text-[#1a1a2e]'
                      : concluida
                      ? 'text-[#1a5c38] font-medium'
                      : 'text-[#5a6570]'
                  }`}
                >
                  {etapa.label}
                  {atual && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-[#1a5c38]/10 text-[#1a5c38] rounded-full">
                      Agora
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA WhatsApp */}
      <div className="bg-[#0d2e1c] rounded-2xl p-6 text-center">
        <p className="text-white/80 text-sm mb-4">
          Dúvidas ou precisa de suporte? Nossa equipe está disponível.
        </p>
        <a
          href="https://wa.me/558199473200"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Falar com a Água Verde
        </a>
      </div>
    </div>
  )
}
