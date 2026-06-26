import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  metadataBase: new URL('https://aguaverde.tur.br'),
  title: 'Água Verde Transfers | Transfer Privado em Recife e Porto de Galinhas',
  description: 'Transfer privado de qualidade no Recife, Porto de Galinhas, Maragogi e região. Motoristas profissionais, frota nova e atendimento em português, inglês e espanhol.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Água Verde Transfers',
    description: 'Transfer privado em Recife e Porto de Galinhas',
    type: 'website',
    images: [
      {
        url: '/images/logo-agua-verde.png',
        width: 512,
        height: 512,
        alt: 'Água Verde Transfers',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-[#fafbfa] text-[#1a1a2e]">
        {children}
      </body>
    </html>
  )
}
