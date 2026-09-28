import "server-only"
import {
  collectCategories,
  isPublished,
  type RawProduct,
  type SiteProduct,
  sortForShowcase,
  toSiteProduct,
} from "@/lib/catalog-rules"
import { firestore } from "@/lib/firebase-admin"

export interface ProductVariant {
  id: string
  sku?: string
  attributes: Record<string, string>
  priceCents: number
  stock: number
  images: string[]
}

/**
 * Leitura do catálogo publicado. Uma consulta por `site.published` e o resto
 * filtrado em memória — evita índice composto no Firestore para um catálogo
 * desta ordem de grandeza (centenas de itens).
 */
export async function listProducts(): Promise<SiteProduct[]> {
  const db = firestore()
  if (!db) return []

  const snapshot = await db.collection("Products").where("site.published", "==", true).get()
  const products = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as RawProduct)
    .filter(isPublished)
    .map(toSiteProduct)

  return sortForShowcase(products)
}

export async function listHighlights(limit = 8): Promise<SiteProduct[]> {
  const products = await listProducts()
  const highlighted = products.filter((product) => product.highlight)
  // Sem destaque marcado, a home mostra o começo da vitrine em vez de um vazio.
  return (highlighted.length ? highlighted : products).slice(0, limit)
}

export async function listCategories() {
  return collectCategories(await listProducts())
}

export async function getProductBySlug(slug: string): Promise<SiteProduct | null> {
  const products = await listProducts()
  return products.find((product) => product.slug === slug) ?? null
}

/** Variações de um produto — só a página de detalhe precisa disso. */
export async function listVariants(productId: string): Promise<ProductVariant[]> {
  const db = firestore()
  if (!db) return []

  const snapshot = await db.collection("productVariants").where("productId", "==", productId).get()
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Record<string, unknown> & { id: string })
    .filter((variant) => variant.isActive !== false)
    .map((variant) => ({
      id: variant.id,
      sku: variant.sku as string | undefined,
      attributes: (variant.attributes as Record<string, string>) ?? {},
      priceCents: Number(variant.price ?? 0),
      stock: Number(variant.stock ?? 0),
      images: ((variant.images as string[]) ?? []).filter(Boolean),
    }))
    .sort((a, b) => a.priceCents - b.priceCents)
}

/** Relacionados: mesma categoria, sem repetir o próprio produto. */
export async function listRelated(product: SiteProduct, limit = 4): Promise<SiteProduct[]> {
  const products = await listProducts()
  return products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, limit)
}
