'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Vídeo de fundo do topo da home. A foto continua por baixo (SEO/LCP); o vídeo só
// entra depois de montar e aparece com fade quando começa a tocar. Não carrega com
// "reduzir movimento" ou "economia de dados" ativos.
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
    <div className={cn('absolute inset-0 transition-opacity duration-1000', playing ? className : 'opacity-0')}>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
        className="h-full w-full object-cover"
      >
        <source src="/videos/hero-praia-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/videos/hero-praia.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
