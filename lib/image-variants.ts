/**
 * Variantes prontas das imagens locais, para o site não depender do otimizador
 * da Vercel (ver `lib/image-loader.ts`): `scripts/optimize-local-images.mjs` gera
 * `{nome}-{L}.webp`. Fotos de produto não passam por aqui: usam o `srcset` de
 * `lib/product-media.ts`.
 */

/** Larguras geradas para as imagens locais. Mantenha igual ao script. */
export const LOCAL_WIDTHS = [640, 1080, 1600, 2172] as const

/** Pastas de `public/` com versões WebP geradas pelo script. */
const LOCAL_VARIANT_DIRS = ["/banners/carousel/"]

function smallestAtLeast<T>(items: readonly T[], size: (item: T) => number, wanted: number): T {
  return items.find((item) => size(item) >= wanted) ?? items[items.length - 1]
}

/** Versão WebP gerada para uma imagem de `public/`, ou `null` se não houver. */
export function localVariantUrl(src: string, width: number): string | null {
  if (!LOCAL_VARIANT_DIRS.some((dir) => src.startsWith(dir))) return null
  const match = src.match(/^(.+)\.(png|jpe?g)$/i)
  if (!match) return null
  const size = smallestAtLeast(LOCAL_WIDTHS, (w) => w, width)
  return `${match[1]}-${size}.webp`
}
