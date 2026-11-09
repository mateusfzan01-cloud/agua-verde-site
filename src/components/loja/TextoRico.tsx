import type { ReactNode } from 'react'

/** Converte o texto das descrições (parágrafos, listas com "- " e **negrito**) em HTML seguro. */
function comNegrito(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith('**') && parte.endsWith('**') ? <strong key={i}>{parte.slice(2, -2)}</strong> : parte,
  )
}

export function TextoRico({ texto, className = '' }: { texto: string; className?: string }) {
  const blocos = texto.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  return (
    <div className={`grid gap-3 ${className}`}>
      {blocos.map((bloco, i) => {
        const linhas = bloco.split('\n')
        const itens = linhas.filter((l) => l.startsWith('- '))
        const titulo = itens.length > 0 && !linhas[0].startsWith('- ') ? linhas[0] : null
        if (itens.length > 0 && itens.length >= linhas.length - (titulo ? 1 : 0)) {
          return (
            <div key={i} className="grid gap-1.5">
              {titulo && <p>{comNegrito(titulo)}</p>}
              <ul className="grid list-disc gap-1 pl-5">
                {itens.map((l, k) => (
                  <li key={k}>{comNegrito(l.slice(2))}</li>
                ))}
              </ul>
            </div>
          )
        }
        return <p key={i}>{comNegrito(bloco.replace(/\n/g, ' '))}</p>
      })}
    </div>
  )
}
