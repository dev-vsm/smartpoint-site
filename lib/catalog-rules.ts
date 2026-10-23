/**
 * Regras puras do catálogo: o que aparece na vitrine, como vira URL e como o
 * preço é apresentado. Sem Firebase aqui — é o que permite testar.
 */

export interface RawProduct {
  id: string
  name?: string
  description?: string
  /** Campo antigo, de texto livre. Só vale quando não há `categorization`. */
  category?: string
  /** Classificação atual do admin: categoria e subcategoria de `catalog_categories`. */
  categorization?: {
    categoryId?: string
    categoryName?: string
    subcategoryId?: string
    subcategoryName?: string
  }
  brand?: string
  images?: string[]
  isActive?: boolean
  totalStock?: number
  priceRange?: { min: number; max: number }
  variantCount?: number
  warranty?: string
  site?: {
    published?: boolean
    highlight?: boolean
    slug?: string
    seoTitle?: string
    seoDescription?: string
    order?: number
  }
}

export interface SiteProduct {
  id: string
  slug: string
  name: string
  description?: string
  category?: string
  brand?: string
  images: string[]
  image?: string
  priceFromCents: number
  priceToCents: number
  hasVariants: boolean
  available: boolean
  highlight: boolean
  order: number
  warranty?: string
  seoTitle?: string
  seoDescription?: string
}

/** Aparece na vitrine quando está ativo no estoque **e** marcado para o site. */
export function isPublished(product: RawProduct): boolean {
  return product.isActive !== false && product.site?.published === true
}

/**
 * Sem preço positivo não há vitrine: o site mostra preço (decisão D5), e
 * "R$ 0,00" quebra a confiança mais do que a ausência do produto.
 */
export function hasPrice(product: SiteProduct): boolean {
  return product.priceFromCents > 0
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

/**
 * URL do produto. Usa o slug cadastrado no admin; sem ele, deriva do nome e
 * acrescenta um sufixo do id para dois produtos de mesmo nome não colidirem.
 */
export function productSlug(product: RawProduct): string {
  const custom = product.site?.slug?.trim()
  if (custom) return slugify(custom)
  const base = slugify(product.name ?? "produto")
  return `${base || "produto"}-${product.id.slice(0, 6).toLowerCase()}`
}

/** Categoria da vitrine: a da classificação atual; sem ela, o campo antigo. */
function productCategory(product: RawProduct): string | undefined {
  return product.categorization?.categoryName?.trim() || product.category?.trim() || undefined
}

export function toSiteProduct(product: RawProduct): SiteProduct {
  const images = (product.images ?? []).filter(Boolean)
  // Preço zero é lixo de cadastro, não promoção: a vitrine ignora e usa o maior
  // preço válido. Produto sem nenhum preço positivo não entra (ver `hasPrice`).
  const rawMin = product.priceRange?.min ?? 0
  const rawMax = product.priceRange?.max ?? rawMin
  const min = rawMin > 0 ? rawMin : rawMax
  const max = rawMax > 0 ? rawMax : min
  return {
    id: product.id,
    slug: productSlug(product),
    name: product.name ?? "Produto",
    description: product.description,
    category: productCategory(product),
    brand: product.brand,
    images,
    image: images[0],
    priceFromCents: min,
    priceToCents: max,
    // "a partir de" só quando os preços realmente variam.
    hasVariants: max > min,
    available: (product.totalStock ?? 0) > 0,
    highlight: product.site?.highlight === true,
    order: product.site?.order ?? Number.MAX_SAFE_INTEGER,
    warranty: product.warranty,
    seoTitle: product.site?.seoTitle,
    seoDescription: product.site?.seoDescription,
  }
}

/** Vitrine ordenada: destaque primeiro, depois a ordem manual, depois o nome. */
export function sortForShowcase(products: SiteProduct[]): SiteProduct[] {
  return [...products].sort((a, b) => {
    if (a.highlight !== b.highlight) return a.highlight ? -1 : 1
    if (a.order !== b.order) return a.order - b.order
    return a.name.localeCompare(b.name, "pt-BR")
  })
}

/**
 * Destaques marcados no admin, na ordem da vitrine. Sem fallback: a home já
 * mostra o começo do catálogo logo abaixo, então repeti-lo seria ruído.
 */
export function pickHighlights(products: SiteProduct[], limit = 12): SiteProduct[] {
  return products.filter((product) => product.highlight).slice(0, limit)
}

/** Lista de categorias com contagem, para os filtros da vitrine. */
export function collectCategories(products: SiteProduct[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>()
  for (const product of products) {
    if (!product.category) continue
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"))
}

/** Minúsculo e sem acento: "Película" e "pelicula" são a mesma busca. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

/**
 * Filtro da vitrine: categoria exata e busca por termos (todos precisam
 * aparecer no nome, na categoria ou na marca, em qualquer ordem).
 */
export function filterProducts(
  products: SiteProduct[],
  { query = "", category }: { query?: string; category?: string | null },
): SiteProduct[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!category && !terms.length) return products

  return products.filter((product) => {
    if (category && product.category !== category) return false
    if (!terms.length) return true
    const haystack = normalize(
      [product.name, product.category, product.brand].filter(Boolean).join(" "),
    )
    return terms.every((term) => haystack.includes(term))
  })
}

/** Produtos por página. Múltiplo de 2, 3 e 4: a última linha fecha em qualquer grade. */
export const CATALOG_PAGE_SIZE = 24

/**
 * URL da vitrine com filtro e página, em ordem fixa (uma URL por estado, bom
 * para cache e para o Google). A página 1 não leva `pagina=`: `/produtos` e
 * `/produtos?pagina=1` seriam conteúdo duplicado.
 */
export function catalogHref({
  category,
  query,
  page = 1,
}: {
  category?: string | null
  query?: string | null
  page?: number
}): string {
  const params = new URLSearchParams()
  if (category) params.set("categoria", category)
  if (query?.trim()) params.set("q", query.trim())
  if (page > 1) params.set("pagina", String(page))
  return params.size ? `/produtos?${params}` : "/produtos"
}
