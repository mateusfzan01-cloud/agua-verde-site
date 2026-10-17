import Image from 'next/image'

/** Fotos do produto em faixa deslizante (as 8 primeiras). */
export function Galeria({ imagens, alt }: { imagens: string[]; alt: string }) {
  if (imagens.length === 0) return null
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" tabIndex={0} aria-label={alt}>
      {imagens.slice(0, 8).map((src, i) => (
        <div key={src} className="relative aspect-[4/3] w-[86%] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#e6f2ea] sm:w-[48%]">
          <Image src={src} alt={i === 0 ? alt : ''} fill sizes="(min-width: 640px) 45vw, 86vw" priority={i === 0} className="object-cover" />
        </div>
      ))}
    </div>
  )
}
