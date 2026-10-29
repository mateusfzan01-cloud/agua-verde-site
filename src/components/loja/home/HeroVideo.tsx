'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Vídeo de fundo do topo da home. A foto continua por baixo (SEO/LCP) até o vídeo
// tocar; aí uma camada opaca com o vídeo cobre a foto (as duas não se misturam).
// Não carrega com "reduzir movimento" ou "economia de dados" ativos.
export function HeroVideo({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (!reduceMotion && !saveData) setEnabled(true)
  }, [])

  if (!enabled) return null

  return (
    <div
      className={cn(
        'absolute inset-0 bg-[#0d2e1c] transition-opacity duration-1000',
        playing ? 'opacity-100' : 'opacity-0'
      )}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
        className={cn('h-full w-full object-cover', className)}
      >
        <source src="/videos/hero-porto-de-galinhas-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/videos/hero-porto-de-galinhas.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
