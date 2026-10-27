/**
 * Escolhe a variante pronta de cada imagem, para o site não depender do
 * otimizador da Vercel (ver `lib/image-loader.ts`).
 *
 * - Fotos de produto: a extensão Resize Images do Firebase gera
 *   `{nome}_{L}x{A}.webp` ao lado da original, encaixando a foto na caixa sem
 *   ampliar. A maioria das fotos é vertical, então numa caixa quadrada com
 *   `object-contain` quem limita é a ALTURA: a escolha é pela altura da caixa.
 * - Banners locais: `scripts/optimize-local-images.mjs` gera `{nome}-{L}.webp`.
 */

/** Caixas configuradas na extensão (largura x altura). Mantenha igual ao Firebase. */
export const FIREBASE_VARIANTS = [
  { w: 32, h: 32 },
  { w: 48, h: 48 },
  { w: 96, h: 96 },
  { w: 128, h: 128 },
  { w: 256, h: 256 },
  { w: 400, h: 300 },
  { w: 1200, h: 900 },
] as const

/** Só esta pasta tem variantes geradas pela extensão. */
const FIREBASE_VARIANT_DIR = "products/"

/** Larguras geradas para as imagens locais. Mantenha igual ao script. */
export const LOCAL_WIDTHS = [640, 1080, 1600, 2172] as const

/** Pastas de `public/` com versões WebP geradas pelo script. */
const LOCAL_VARIANT_DIRS = ["/banners/carousel/"]

function smallestAtLeast<T>(items: readonly T[], size: (item: T) => number, wanted: number): T {
  return items.find((item) => size(item) >= wanted) ?? items[items.length - 1]
}

/**
 * URL da variante do Resize Images para uma foto do Storage, ou `null` quando a
 * imagem não tem variantes (outra pasta, SVG, URL que não é do Firebase).
 * Sem token: as regras do Storage liberam leitura pública dessas pastas.
 */
export function firebaseVariantUrl(src: string, width: number): string | null {
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return null
  }
  if (url.host !== "firebasestorage.googleapis.com") return null

  const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/)
  if (!match) return null
  const [, bucket, encodedPath] = match
  const path = decodeURIComponent(encodedPath)
  if (!path.startsWith(FIREBASE_VARIANT_DIR) || path.toLowerCase().endsWith(".svg")) return null

  const dot = path.lastIndexOf(".")
  if (dot <= path.lastIndexOf("/")) return null

  const box = smallestAtLeast(FIREBASE_VARIANTS, (variant) => variant.h, width)
  const variantPath = `${path.slice(0, dot)}_${box.w}x${box.h}.webp`
  return `https://${url.host}/v0/b/${bucket}/o/${encodeURIComponent(variantPath)}?alt=media`
}

/** Versão WebP gerada para uma imagem de `public/`, ou `null` se não houver. */
export function localVariantUrl(src: string, width: number): string | null {
  if (!LOCAL_VARIANT_DIRS.some((dir) => src.startsWith(dir))) return null
  const match = src.match(/^(.+)\.(png|jpe?g)$/i)
  if (!match) return null
  const size = smallestAtLeast(LOCAL_WIDTHS, (w) => w, width)
  return `${match[1]}-${size}.webp`
}
