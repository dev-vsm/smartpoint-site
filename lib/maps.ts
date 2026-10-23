export interface StoreMap {
  /** Vai no `src` do iframe. */
  embedUrl: string
  /** Abre o Google Maps (no celular, o app) para traçar a rota. */
  linkUrl: string
}

interface MapSource {
  /** Link de compartilhamento do Maps (`maps.app.goo.gl/...`): vira o link. */
  mapsUrl?: string
  /** Link de incorporação (`/maps/embed?pb=...`): vira o iframe, com o pino exato. */
  mapsEmbedUrl?: string
  addressLine: string
  cityLine: string
  postalCode?: string
}

function isEmbedUrl(url: string) {
  return url.includes("/maps/embed") || url.includes("output=embed")
}

/**
 * Mapa da loja sem SDK nem chave de API. O que o admin cadastrou vence: o embed
 * em `mapsEmbedUrl` acerta o pino, e o link em `mapsUrl` abre a ficha da loja.
 * Faltando um deles, o endereço preenche o buraco. Sem nada, sem mapa.
 *
 * Os dois campos aceitam qualquer um dos formatos — colar o embed no campo do
 * link (ou o contrário) não quebra o iframe.
 */
export function buildStoreMap(source: MapSource): StoreMap | undefined {
  const urls = [source.mapsEmbedUrl, source.mapsUrl]
    .map((url) => url?.trim())
    .filter(Boolean) as string[]
  const embed = urls.find(isEmbedUrl)
  const link = urls.find((url) => !isEmbedUrl(url))

  // Os separadores de `addressLine` são para gente ler, não para o geocoder.
  const query = [source.addressLine, source.cityLine, source.postalCode]
    .filter(Boolean)
    .join(", ")
    .replace(/ — | · /g, ", ")
  const q = query ? encodeURIComponent(query) : null

  const embedUrl = embed ?? (q && `https://www.google.com/maps?q=${q}&output=embed`)
  const linkUrl = link ?? (q ? `https://www.google.com/maps/search/?api=1&query=${q}` : embed)
  return embedUrl && linkUrl ? { embedUrl, linkUrl } : undefined
}
