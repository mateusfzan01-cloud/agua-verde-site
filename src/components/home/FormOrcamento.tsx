'use client'

import { useState } from 'react'
import { Send, Check, MapPin, Calendar, Users, Briefcase, Plane, MessageSquare, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface FormOrcamentoProps {
  initialOrigem?: string
  initialDestino?: string
}

export function FormOrcamento({ initialOrigem, initialDestino }: FormOrcamentoProps = {}) {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErro(false)

    const form = e.currentTarget
    const data = new FormData(form)
    const dataHora = data.get('data_hora')
      ? new Date(String(data.get('data_hora'))).toISOString()
      : null

    const { error } = await supabase.from('orcamentos_site').insert({
      passageiro_nome: String(data.get('nome') || ''),
      passageiro_telefone: String(data.get('telefone') || '') || null,
      passageiro_email: String(data.get('email') || '') || null,
      origem: String(data.get('origem') || '') || null,
      destino: String(data.get('destino') || '') || null,
      data_hora: dataHora,
      quantidade_passageiros: parseInt(String(data.get('passageiros') || '1'), 10),
      quantidade_bagagens: parseInt(String(data.get('bagagens') || '0'), 10),
      numero_voo: String(data.get('voo') || '') || null,
      observacoes: String(data.get('observacoes') || '') || null,
    })

    form.reset()
    setLoading(false)

    if (error) {
      setErro(true)
    } else {
      setEnviado(true)
    }
  }

  if (erro) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#1a5c38]/10 shadow-lg text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-[#1a1a2e] mb-3">
          Não foi possível enviar
        </h3>
        <p className="text-[#5a6570] mb-6 max-w-md mx-auto">
          Ocorreu um erro ao enviar seu orçamento. Por favor, tente novamente ou fale com a gente diretamente pelo WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => setErro(false)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a5c38] text-white font-medium rounded-full hover:bg-[#1a5c38]/90 transition-colors mr-3"
        >
          Tentar novamente
        </button>
        <a
          href="https://wa.me/558199473200"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#25d366] text-white font-medium rounded-full hover:bg-[#25d366]/90 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    )
  }

  if (enviado) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#1a5c38]/10 shadow-lg text-center">
        <div className="w-16 h-16 bg-[#27ae60]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-[#27ae60]" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-[#1a1a2e] mb-3">
          Orçamento enviado!
        </h3>
        <p className="text-[#5a6570] mb-6 max-w-md mx-auto">
          Recebemos sua solicitação. Nossa equipe entrará em contato em breve via WhatsApp ou e-mail com seu orçamento personalizado.
        </p>
        <a
          href="https://wa.me/558199473200"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a5c38] text-white font-medium rounded-full hover:bg-[#1a5c38]/90 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Falar no WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#1a5c38]/10 shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nome */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            Nome completo
          </label>
          <input
            type="text"
            name="nome"
            required
            placeholder="Seu nome"
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            WhatsApp / Telefone
          </label>
          <input
            type="tel"
            name="telefone"
            required
            placeholder="+55 81 9947-3200"
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            placeholder="seu@email.com"
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          />
        </div>

        {/* Origem */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1a5c38]" />
              Origem
            </span>
          </label>
          <input
            type="text"
            name="origem"
            required
            placeholder="Ex: Aeroporto do Recife"
            defaultValue={initialOrigem}
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          />
        </div>

        {/* Destino */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#27ae60]" />
              Destino
            </span>
          </label>
          <input
            type="text"
            name="destino"
            required
            placeholder="Ex: Porto de Galinhas"
            defaultValue={initialDestino}
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          />
        </div>

        {/* Data/Hora */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1a5c38]" />
              Data e hora
            </span>
          </label>
          <input
            type="datetime-local"
            name="data_hora"
            required
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          />
        </div>

        {/* Passageiros */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#1a5c38]" />
              Passageiros
            </span>
          </label>
          <select
            name="passageiros"
            required
            defaultValue=""
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          >
            <option value="" disabled>Selecione</option>
            <option value="1">1 passageiro</option>
            <option value="2">2 passageiros</option>
            <option value="3">3 passageiros</option>
            <option value="4">4 passageiros</option>
            <option value="5">5+ passageiros</option>
          </select>
        </div>

        {/* Bagagens */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#1a5c38]" />
              Bagagens grandes
            </span>
          </label>
          <select
            name="bagagens"
            defaultValue="0"
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          >
            <option value="0">Nenhuma</option>
            <option value="1">1 mala</option>
            <option value="2">2 malas</option>
            <option value="3">3 malas</option>
            <option value="4">4+ malas</option>
          </select>
        </div>

        {/* Voo */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            <span className="flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-[#1a5c38]" />
              Número do voo
            </span>
          </label>
          <input
            type="text"
            name="voo"
            placeholder="Ex: G3 1234 (opcional)"
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all"
          />
        </div>

        {/* Observações */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
            Observações
          </label>
          <textarea
            name="observacoes"
            rows={3}
            placeholder="Cadeira infantil, necessidades especiais, etc. (opcional)"
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1a5c38] text-white font-semibold rounded-full hover:bg-[#1a5c38]/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Solicitar Orçamento
          </>
        )}
      </button>
    </form>
  )
}
