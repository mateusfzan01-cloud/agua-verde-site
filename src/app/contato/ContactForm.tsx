'use client'

import { useState } from 'react'
import { Send, Check, MessageSquare } from 'lucide-react'

export function ContactForm() {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#1a5c38]/10 shadow-sm text-center">
        <div className="w-14 h-14 bg-[#27ae60]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="w-7 h-7 text-[#27ae60]" />
        </div>
        <h3 className="text-xl font-heading font-bold text-[#1a1a2e] mb-2">
          Mensagem enviada!
        </h3>
        <p className="text-[#5a6570] text-sm mb-6 max-w-xs mx-auto">
          Nossa equipe responderá em breve pelo WhatsApp ou e-mail.
        </p>
        <a
          href="https://wa.me/558199473200"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a5c38] text-white font-medium rounded-full hover:bg-[#27ae60] transition-colors text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Continuar pelo WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#1a5c38]/10 shadow-sm space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Nome</label>
          <input
            type="text"
            required
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-2">WhatsApp / Telefone</label>
          <input
            type="tel"
            required
            placeholder="+55 81 9947-3200"
            className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] mb-2">E-mail</label>
        <input
          type="email"
          placeholder="seu@email.com (opcional)"
          className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Assunto</label>
        <select
          className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all text-sm"
          defaultValue=""
        >
          <option value="" disabled>Selecione o assunto</option>
          <option value="orcamento">Solicitar orçamento</option>
          <option value="reserva">Informação sobre reserva</option>
          <option value="parceria">Parceria comercial</option>
          <option value="outro">Outro assunto</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Mensagem</label>
        <textarea
          required
          rows={4}
          placeholder="Como podemos ajudar?"
          className="w-full px-4 py-3 rounded-xl border border-[#1a5c38]/15 bg-[#fafbfa] text-[#1a1a2e] placeholder:text-[#5a6570]/50 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] transition-all resize-none text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#1a5c38] text-white font-semibold rounded-full hover:bg-[#27ae60] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Enviar mensagem
          </>
        )}
      </button>
    </form>
  )
}
