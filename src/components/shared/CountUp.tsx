'use client'

import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  value: number
  /** Idioma da formatação do milhar (pt-BR → 8.211, en-GB → 8,211). */
  localeTag?: string
  duration?: number
}

// Conta de 0 até `value` quando o número entra na tela. O HTML do servidor já traz
// o valor final (SEO / sem JS); a contagem só acontece se o número ainda não estiver
// visível ao carregar.
export function CountUp({ value, localeTag = 'pt-BR', duration = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          setDisplay(value * (1 - Math.pow(1 - t, 3)))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )

    if (el.getBoundingClientRect().top > window.innerHeight) {
      setDisplay(0)
      observer.observe(el)
    }
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration])

  return <span ref={ref}>{Math.round(display).toLocaleString(localeTag)}</span>
}
