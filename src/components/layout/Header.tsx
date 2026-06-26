'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X, Phone, ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const destinos = [
  {
    label: 'Transfer Porto de Galinhas',
    href: '/transfer-porto-de-galinhas',
    desc: 'Aeroporto REC → PDG · ~70 km',
  },
  {
    label: 'Transfer Praia de Carneiros',
    href: '/transfer-praia-de-carneiros',
    desc: 'Aeroporto REC → Tamandaré · ~115 km',
  },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [destinosOpen, setDestinosOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#1a5c38]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <a href="/" className="flex items-center">
            <Image
              src="/images/logo-agua-verde.png"
              alt="Água Verde Transfers"
              width={160}
              height={64}
              className="w-24 h-auto sm:w-28 lg:w-32 object-contain"
              priority
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="/"
              className="text-sm font-medium text-[#1a1a2e] hover:text-[#1a5c38] transition-colors"
            >
              Início
            </a>

            {/* Destinos dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDestinosOpen(true)}
              onMouseLeave={() => setDestinosOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-[#1a1a2e] hover:text-[#1a5c38] transition-colors">
                Destinos
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    destinosOpen && 'rotate-180'
                  )}
                />
              </button>

              <div
                className={cn(
                  'absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200',
                  destinosOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
                )}
              >
                <div className="bg-white rounded-2xl shadow-xl shadow-black/8 border border-[#1a5c38]/8 p-2 w-64">
                  {destinos.map((d) => (
                    <a
                      key={d.href}
                      href={d.href}
                      className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#fafbfa] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#1a5c38]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1a5c38]/15 transition-colors">
                        <MapPin className="w-4 h-4 text-[#1a5c38]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1a2e] leading-tight">{d.label}</p>
                        <p className="text-xs text-[#5a6570] mt-0.5">{d.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="/quem-somos"
              className="text-sm font-medium text-[#1a1a2e] hover:text-[#1a5c38] transition-colors"
            >
              Quem Somos
            </a>
            <a
              href="/contato"
              className="text-sm font-medium text-[#1a1a2e] hover:text-[#1a5c38] transition-colors"
            >
              Contato
            </a>
          </nav>

            <noscript>
              <a href="/transfer-porto-de-galinhas" className="sr-only">Transfer Porto de Galinhas</a>
              <a href="/transfer-praia-de-carneiros" className="sr-only">Transfer Praia de Carneiros</a>
            </noscript>

          {/* CTA Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="https://wa.me/558199473200"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a5c38] text-white text-sm font-medium rounded-full hover:bg-[#1a5c38]/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-[#1a1a2e]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'lg:hidden absolute top-full left-0 right-0 bg-white border-b border-[#1a5c38]/10 shadow-lg transition-all',
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      >
        <nav className="flex flex-col p-4 gap-1">
          <a
            href="/"
            className="px-4 py-3 text-sm font-medium text-[#1a1a2e] hover:bg-[#1a5c38]/5 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Início
          </a>

          {/* Destinos mobile */}
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-[#5a6570] uppercase tracking-wider mb-2">
              Destinos
            </p>
            {destinos.map((d) => (
              <a
                key={d.href}
                href={d.href}
                className="flex items-center gap-3 py-2.5 text-sm font-medium text-[#1a1a2e] hover:text-[#1a5c38] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="w-4 h-4 text-[#1a5c38] shrink-0" />
                {d.label}
              </a>
            ))}
          </div>

          <a
            href="/quem-somos"
            className="px-4 py-3 text-sm font-medium text-[#1a1a2e] hover:bg-[#1a5c38]/5 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Quem Somos
          </a>
          <a
            href="/contato"
            className="px-4 py-3 text-sm font-medium text-[#1a1a2e] hover:bg-[#1a5c38]/5 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contato
          </a>

          <a
            href="https://wa.me/558199473200"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1a5c38] text-white text-sm font-medium rounded-full"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Phone className="w-4 h-4" />
            Falar no WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
