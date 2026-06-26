import { MessageCircle } from 'lucide-react'

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/558199473200"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#25D366] text-white rounded-full shadow-lg shadow-[#25D366]/30 hover:scale-105 transition-transform"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
      <span className="text-sm font-semibold hidden sm:inline">Falar no WhatsApp</span>
    </a>
  )
}
