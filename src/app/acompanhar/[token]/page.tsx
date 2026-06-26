import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'
import { TripTracker } from './TripTracker'

export const metadata: Metadata = {
  title: 'Acompanhar Viagem | Água Verde Transfers',
  description: 'Acompanhe o status da sua viagem em tempo real.',
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ token: string }>
}

export default async function AcompanharTokenPage({ params }: Props) {
  const { token } = await params

  return (
    <>
      <Header />

      <main className="pt-16 lg:pt-20 min-h-screen bg-[#fafbfa]">
        {/* Header da seção */}
        <div className="bg-white border-b border-[#1a5c38]/8 py-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 bg-[#1a5c38]/10 text-[#1a5c38] text-sm font-semibold rounded-full mb-4">
              Acompanhamento
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#1a1a2e]">
              Sua viagem com a Água Verde
            </h1>
          </div>
        </div>

        {/* Tracker (client component com Supabase) */}
        <div className="py-10">
          <TripTracker token={token} />
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
