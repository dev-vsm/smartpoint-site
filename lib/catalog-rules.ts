import {
  type ProductImage,
  parseMedia,
  productCover,
  productImage,
  shareImage,
} from "@/lib/product-media"

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
  /** Fotos do produto, em ordem (`MediaItem[]`); validado em `parseMedia`. */
  media?: unknown
  isActive?: boolean
  /**
   * Produto é documento único no admin (sem `productVariants`): preço (centavos),
   * estoque, SKU e características ficam no próprio documento.
   */
  price?: number
  stock?: number
  sku?: string | null
  /** Características (`Cor: Preto`); validado em `parseSpecs`. */
  specs?: unknown
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
  /** Todas as fotos, na ordem do admin, com as URLs já montadas. */
  media: ProductImage[]
  /** Capa: `media[0]`. Sem ela, o card mostra "sem foto". */
  cover?: ProductImage
  /** Imagem de compartilhamento (Open Graph), derivada da capa. */
  share?: { url: string; width: number; height: number }
  priceCents: number
  /** Estoque, só para limitar a quantidade no carrinho — não aparece na vitrine (quase tudo tem pouco). */
  stock: number
  sku?: string
  /** Características cadastradas no admin, na ordem (`Cor: Preto`). */
  specs: ProductSpec[]
  availability: Availability
  /** Subcategoria da classificação atual (`categorization.subcategoryName`). */
  subcategory?: string
  /** Id da subcategoria — decide se a variação esgotada vira encomenda. */
  subcategoryId?: string
  highlight: boolean
  /** Ordena os mais vendidos e, a partir de 10, vira "+50 vendidos" no card (arredondado para baixo). */
  totalSold: number
  order: number
  warranty?: string
  seoTitle?: string
  seoDescription?: string
}

/** Característica do produto (nome/valor), como o admin grava em `specs`. */
export interface ProductSpec {
  name: string
  value: string
}

/** Lê `specs` do documento, ignorando linha sem nome ou sem valor. */
export function parseSpecs(value: unknown): ProductSpec[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const name = typeof item?.name === "string" ? item.name.trim() : ""
    const spec = typeof item?.value === "string" ? item.value.trim() : ""
    return name && spec ? [{ name, value: spec }] : []
  })
}

/** "Preto · USB-C": os valores das características, na ordem (vazio sem nenhuma). */
export function specsLabel(specs: readonly ProductSpec[]): string {
  return specs.map((spec) => spec.value).join(" · ")
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
/**
 * Só os campos do documento que o site usa, como dados simples. É o que vai para o cache de
 * dados do Next (limite de 2 MB por item): o documento inteiro traz custo, fornecedor e
 * datas, e o `SiteProduct` pronto repete URLs longas de foto em cada `srcset`.
 */
export function pickRawProduct(id: string, data: Record<string, unknown>): RawProduct {
  const raw = data as Omit<RawProduct, "id">
  const site = raw.site
  return JSON.parse(
    JSON.stringify({
      id,
      name: raw.name,
      description: raw.description,
      category: raw.category,
      categorization: raw.categorization,
      brand: raw.brand,
      media: Array.isArray(raw.media)
        ? raw.media.map((item: Record<string, unknown>) => ({
            id: item?.id,
            type: item?.type,
            path: item?.path,
            width: item?.width,
            height: item?.height,
            alt: item?.alt,
          }))
        : undefined,
      isActive: raw.isActive,
      price: raw.price,
      stock: raw.stock,
      sku: raw.sku,
      specs: raw.specs,
      totalSold: raw.totalSold,
      warranty: raw.warranty,
      site: site && {
        published: site.published,
        highlight: site.highlight,
        slug: site.slug,
        seoTitle: site.seoTitle,
        seoDescription: site.seoDescription,
        order: site.order,
      },
    }),
  ) as RawProduct
}

export function isPublished(product: RawProduct): boolean {
  return product.isActive !== false && product.site?.published === true
}

/**
 * Sem preço positivo não há vitrine: o site mostra preço (decisão D5), e
 * "R$ 0,00" quebra a confiança mais do que a ausência do produto.
 */
export function hasPrice(product: SiteProduct): boolean {
  return product.priceCents > 0
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

export function toSiteProduct(product: RawProduct, bucket?: string): SiteProduct {
  const name = product.name ?? "Produto"
  const rawMedia = parseMedia(product.media)
  const media = rawMedia.map((item) => productImage(item, name, bucket))
  const cover = productCover(rawMedia)
  // Preço zero (ou inválido) é lixo de cadastro, não promoção: o produto não entra (ver `hasPrice`).
  const price = Number(product.price)
  const sku = typeof product.sku === "string" ? product.sku.trim() : ""
  return {
    id: product.id,
    slug: productSlug(product),
    name,
    description: product.description,
    category: productCategory(product),
    brand: product.brand,
    media,
    cover: productCover(media),
    share: cover ? shareImage(cover, bucket) : undefined,
    priceCents: Number.isFinite(price) && price > 0 ? Math.round(price) : 0,
    stock: Math.max(0, Math.trunc(Number(product.stock) || 0)),
    ...(sku ? { sku } : {}),
    specs: parseSpecs(product.specs),
    availability: availabilityOf(
      Number(product.stock) || 0,
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
 * aparecer no nome, na categoria, na subcategoria, na marca ou nas
 * características, em qualquer ordem).
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
      [
        product.name,
        product.category,
        product.subcategory,
        product.brand,
        specsLabel(product.specs),
      ]
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

/** Até 2 características curtas, sem repetir o nome do produto ("Uchiha Madara" já está no título). */
const MAX_CHIPS = 2
const plain = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()

export function cardChips(specs: readonly ProductSpec[], name: string): string[] {
  const title = plain(name)
  const seen = new Set<string>()
  return specs
    .map((spec) => spec.value.trim())
    .filter((value) => {
      const key = plain(value)
      if (!key || seen.has(key) || title.includes(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_CHIPS)
}

/** Características que dizem em qual celular o produto serve (capinha, película, carregador). */
const COMPAT_SPECS = new Set(["modelo", "compatibilidade"])

/** "Galaxy S24", quando o produto tem a característica de modelo/compatibilidade. */
export function compatibilityOf(product: Pick<SiteProduct, "specs">): string | undefined {
  return product.specs.find((spec) => COMPAT_SPECS.has(plain(spec.name)))?.value.trim() || undefined
}

/**
 * "Compre junto": complementos, não concorrentes — produtos de pronta entrega de **outra**
 * categoria que servem no **mesmo** modelo (película do S24 para a capinha do S24). Os mais
 * vendidos primeiro. Sem modelo no produto, não há como saber o que combina: lista vazia.
 */
export function pickComplements(
  product: SiteProduct,
  catalog: readonly SiteProduct[],
  limit = 2,
): SiteProduct[] {
  const model = compatibilityOf(product)
  if (!model) return []
  const key = plain(model)
  const kind = product.subcategoryId ?? product.category
  return catalog
    .filter(
      (item) =>
        item.id !== product.id &&
        item.availability === "in_stock" &&
        item.stock > 0 &&
        (item.subcategoryId ?? item.category) !== kind &&
        plain(compatibilityOf(item) ?? "") === key,
    )
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit)
}

/** Nota do item no carrinho: garantia e compatibilidade, o que tranquiliza na hora de pagar. */
export function cartNote(
  product: Pick<SiteProduct, "specs" | "warranty">,
  storeWarranty?: string,
): string | undefined {
  const warranty = product.warranty ?? storeWarranty
  const model = compatibilityOf(product)
  return [warranty && `Garantia de ${warranty}`, model].filter(Boolean).join(" · ") || undefined
}
