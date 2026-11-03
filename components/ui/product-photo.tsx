"use client"

import { useEffect, useRef, useState } from "react"
import type { ProductImage } from "@/lib/product-media"

/**
 * Foto de produto com `srcset` das variantes do Resize Images — sem passar pelo
 * otimizador do Next/Vercel. Logo depois do upload a variante pode ainda não
 * existir: no primeiro erro, troca uma vez para a original, sem `srcset`.
 */
export function ProductPhoto({
  image,
  sizes,
  alt = image.alt,
  className,
  eager = false,
}: {
  image: ProductImage
  /** Espaço real que a foto ocupa em cada layout. Obrigatório. */
  sizes: string
  alt?: string
  className?: string
  /** Visível na abertura (LCP): carrega na hora e com prioridade. */
  eager?: boolean
}) {
  const ref = useRef<HTMLImageElement>(null)
  const [failed, setFailed] = useState(false)

  // O erro pode acontecer antes da hidratação, quando o `onError` ainda não existe.
  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth === 0) setFailed(true)
  }, [])

  return (
    // biome-ignore lint/performance/noImgElement: srcset próprio das variantes do Storage.
    <img
      ref={ref}
      src={failed ? image.original : image.src}
      srcSet={failed ? undefined : image.srcSet}
      sizes={failed ? undefined : sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
