/**
 * Fotos de produto: a única porta entre `Products.media` e as telas. Sem React e
 * sem SDK — roda no servidor, no navegador e nos testes.
 *
 * - `Products/{id}.media`: lista ordenada; a capa é `media[0]` (produto é
 *   documento único: não há mais foto por variação).
 * - A extensão Resize Images gera `{nome}_{L}x{A}.webp` ao lado da original,
 *   encaixando a foto na caixa sem ampliar. O `srcset` segue o mesmo algoritmo do
 *   admin (`lib/media/variants.ts` no smartpoint-admin).
 */

export interface MediaItem {
  id: string
  type: "image"
  /** Caminho no Storage: `products/{productId}/{id}.{ext}`. */
  path: string
  /** Dimensões da original, em px. */
  width: number
  height: number
  contentType: string
  size: number
  alt?: string
  createdAt: string
}

/** Foto pronta para a tela: URLs montadas e texto alternativo resolvido. */
export interface ProductImage {
  id: string
  src: string
  srcSet: string
  /** Original, para quando a variante ainda não foi gerada. */
  original: string
  width: number
  height: number
  alt: string
}

export interface MediaSource {
  src: string
  srcSet: string
  original: string
}

/** Caixas da extensão Resize Images, na ordem. Mantenha igual ao Firebase e ao admin. */
export const RESIZE_BOXES = [
  { w: 32, h: 32 },
  { w: 48, h: 48 },
  { w: 96, h: 96 },
  { w: 128, h: 128 },
  { w: 256, h: 256 },
  { w: 400, h: 300 },
  { w: 1200, h: 900 },
] as const

const OG_BOX = { w: 1200, h: 900 }

/**
 * Bucket do ambiente (staging e produção são diferentes). Lido só no servidor:
 * as URLs saem prontas em `SiteProduct.media`.
 */
export function storageBucket(): string {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET?.trim()
  if (bucket) return bucket
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  return projectId ? `${projectId}.firebasestorage.app` : ""
}

/** URL pública, sem token: as regras do Storage liberam a leitura de `products/**`. */
export function storageUrl(path: string, bucket = storageBucket()): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`
}

/** Tamanho real da variante: encaixa na caixa mantendo a proporção, sem ampliar. */
export function fitInside(width: number, height: number, box: { w: number; h: number }) {
  const scale = Math.min(1, box.w / width, box.h / height)
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/** `{pasta}/{nome}_{L}x{A}.webp`, ao lado da original. */
export function variantPath(path: string, box: { w: number; h: number }): string {
  const slash = path.lastIndexOf("/")
  const dir = path.slice(0, slash + 1)
  const file = path.slice(slash + 1)
  const dot = file.lastIndexOf(".")
  const name = dot === -1 ? file : file.slice(0, dot)
  return `${dir}${name}_${box.w}x${box.h}.webp`
}

/** `src`/`srcSet` de uma mídia; o navegador escolhe pelo `sizes` de cada tela. */
export function mediaSource(
  media: Pick<MediaItem, "path" | "width" | "height">,
  bucket?: string,
): MediaSource {
  const original = storageUrl(media.path, bucket)
  const candidates: { url: string; width: number }[] = []
  const seen = new Set<number>()

  for (const box of RESIZE_BOXES) {
    const { width } = fitInside(media.width, media.height, box)
    // Foto pequena: várias caixas dão a mesma largura, e nenhuma passa da original.
    if (seen.has(width) || width >= media.width) continue
    seen.add(width)
    candidates.push({ url: storageUrl(variantPath(media.path, box), bucket), width })
  }
  candidates.push({ url: original, width: media.width })

  const middle = candidates.find((c) => c.width >= 300) ?? candidates[candidates.length - 1]
  return {
    src: middle.url,
    srcSet: candidates.map((c) => `${c.url} ${c.width}w`).join(", "),
    original,
  }
}

/**
 * Lê `media` do documento como veio do Firestore, descartando o que não dá para
 * desenhar (sem caminho ou sem dimensões). Sem `media` = produto sem foto.
 */
export function parseMedia(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is MediaItem =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.path === "string" &&
      item.path !== "" &&
      Number(item.width) > 0 &&
      Number(item.height) > 0,
  )
}

/** Capa do produto: a primeira mídia. */
export function productCover<T>(media: readonly T[]): T | undefined {
  return media[0]
}

/** Mídia → foto pronta para a tela; o `alt` cai para o nome do produto. */
export function productImage(item: MediaItem, productName: string, bucket?: string): ProductImage {
  return {
    id: item.id,
    ...mediaSource(item, bucket),
    width: item.width,
    height: item.height,
    alt: item.alt?.trim() || productName,
  }
}

/** Open Graph: a variante 1200x900, ou a original quando a foto já cabe nela. */
export function shareImage(item: MediaItem, bucket?: string) {
  const fitted = fitInside(item.width, item.height, OG_BOX)
  const fits = fitted.width >= item.width
  return {
    url: storageUrl(fits ? item.path : variantPath(item.path, OG_BOX), bucket),
    width: fitted.width,
    height: fitted.height,
  }
}
