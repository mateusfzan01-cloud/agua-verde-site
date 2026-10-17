'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Recarrega os dados da página a cada poucos segundos (enquanto espera o pagamento). */
export function AtualizaSozinho({ ativo, cadaMs = 5000 }: { ativo: boolean; cadaMs?: number }) {
  const router = useRouter()
  useEffect(() => {
    if (!ativo) return
    const id = setInterval(() => router.refresh(), cadaMs)
    return () => clearInterval(id)
  }, [ativo, cadaMs, router])
  return null
}
