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
  /** Unidades vendidas: o admin soma a cada venda e desconta nas trocas. */
  totalSold?: number
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
  availability: Availability
  /** Subcategoria da classificação atual (`categorization.subcategoryName`). */
  subcategory?: string
  /** Id da subcategoria — decide se a variação esgotada vira encomenda. */
  subcategoryId?: string
  highlight: boolean
  /** Só ordena os mais vendidos; o número nunca aparece na tela. */
  totalSold: number
  order: number
  warranty?: string
  seoTitle?: string
  seoDescription?: string
}

/**
 * Situação do produto na vitrine:
 * - `in_stock`: tem no balcão, pronto para retirar ou entregar;
 * - `on_order`: acabou, mas a loja encomenda (ver `ON_ORDER_SUBCATEGORIES`);
 * - `sold_out`: acabou e não há encomenda — continua visível, sempre no fim da lista.
 */
export type Availability = "in_stock" | "on_order" | "sold_out"

/**
 * Subcategorias que a loja traz por encomenda quando o estoque zera — hoje só
 * os bonecos e action figures. O id é o de `catalog_categories`.
 */
export const ON_ORDER_SUBCATEGORIES = new Set(["presentes-e-colecionaveis--bonecos"])

export function availabilityOf(stock: number, subcategoryId?: string): Availability {
  if (stock > 0) return "in_stock"
  return subcategoryId && ON_ORDER_SUBCATEGORIES.has(subcategoryId) ? "on_order" : "sold_out"
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
    availability: availabilityOf(
      product.totalStock ?? 0,
      product.categorization?.subcategoryId?.trim(),
    ),
    subcategory: product.categorization?.subcategoryName?.trim() || undefined,
    subcategoryId: product.categorization?.subcategoryId?.trim() || undefined,
    highlight: product.site?.highlight === true,
    totalSold: Math.max(0, Number(product.totalSold) || 0),
    order: product.site?.order ?? Number.MAX_SAFE_INTEGER,
    warranty: product.warranty,
    seoTitle: product.site?.seoTitle,
    seoDescription: product.site?.seoDescription,
  }
}

/**
 * Vitrine ordenada: o que dá para levar vem antes do esgotado — sempre, nem
 * destaque passa na frente. Dentro de cada grupo: destaque, ordem manual, nome.
 */
export function sortForShowcase(products: SiteProduct[]): SiteProduct[] {
  return [...products].sort((a, b) => {
    const soldOut = Number(a.availability === "sold_out") - Number(b.availability === "sold_out")
    if (soldOut !== 0) return soldOut
    if (a.highlight !== b.highlight) return a.highlight ? -1 : 1
    if (a.order !== b.order) return a.order - b.order
    return a.name.localeCompare(b.name, "pt-BR")
  })
}

/**
 * Destaques marcados no admin, na ordem da vitrine. Sem fallback: a home já
 * mostra o começo do catálogo logo abaixo, então repeti-lo seria ruído.
 * Esgotado não vira destaque: vitrine de oferta é do que dá para levar.
 */
export function pickHighlights(products: SiteProduct[], limit = 12): SiteProduct[] {
  return products
    .filter((product) => product.highlight && product.availability !== "sold_out")
    .slice(0, limit)
}

/**
 * Mais vendidos, pelo contador `totalSold` do admin. Fica de fora o que nunca
 * vendeu e o que está esgotado (não dá para levar). No empate, vale o destaque
 * marcado no admin e depois a ordem da vitrine.
 */
export function pickBestSellers(products: SiteProduct[], limit = 12): SiteProduct[] {
  return products
    .filter((product) => product.totalSold > 0 && product.availability !== "sold_out")
    .sort(
      (a, b) =>
        b.totalSold - a.totalSold ||
        Number(b.highlight) - Number(a.highlight) ||
        a.order - b.order ||
        a.name.localeCompare(b.name, "pt-BR"),
    )
    .slice(0, limit)
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
 * aparecer no nome, na categoria, na subcategoria ou na marca, em qualquer ordem).
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
      [product.name, product.category, product.subcategory, product.brand]
        .filter(Boolean)
        .join(" "),
    )
    return terms.every((term) => haystack.includes(term))
  })
}

/** Produtos por página. Múltiplo de 2, 3 e 4: a última linha fecha em qualquer grade. */
export const CATALOG_PAGE_SIZE = 20
export const CATALOG_PAGE_SIZES = [20, 40, 60] as const

/**
 * URL da vitrine com filtro e página, em ordem fixa (uma URL por estado, bom
 * para cache e para o Google). A página 1 não leva `pagina=`: `/produtos` e
 * `/produtos?pagina=1` seriam conteúdo duplicado.
 */
export function catalogHref({
  category,
  query,
  page = 1,
  perPage = CATALOG_PAGE_SIZE,
}: {
  category?: string | null
  query?: string | null
  page?: number
  perPage?: number
}): string {
  const params = new URLSearchParams()
  if (category) params.set("categoria", category)
  if (query?.trim()) params.set("q", query.trim())
  if (perPage !== CATALOG_PAGE_SIZE) params.set("porPagina", String(perPage))
  if (page > 1) params.set("pagina", String(page))
  return params.size ? `/produtos?${params}` : "/produtos"
}
