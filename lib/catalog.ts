import "server-only"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import {
  collectCategories,
  hasPrice,
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
async function readPublishedProducts(): Promise<SiteProduct[]> {
  const db = firestore()
  if (!db) return []

  const snapshot = await db.collection("Products").where("site.published", "==", true).get()
  const products = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as RawProduct)
    .filter(isPublished)
    .map(toSiteProduct)
    .filter(hasPrice)

  return sortForShowcase(products)
}

/**
 * Duas camadas de cache:
 * - `unstable_cache` guarda o catálogo entre requisições por 5 minutos (a mesma
 *   janela do ISR). Sem ele, `/produtos` — que renderiza por requisição por
 *   causa de `?pagina=` e `?q=` — leria o Firestore inteiro a cada visita.
 * - `cache` do React dedupa dentro de uma renderização: a página e o menu de
 *   categorias pedem o catálogo, mas a leitura acontece uma vez.
 *
 * `unstable_cache` é o caminho do Next 16 sem Cache Components; ao migrar para
 * `cacheComponents`, ele vira a diretiva `"use cache"` com `cacheLife`.
 */
// A versão na chave muda quando o formato de `SiteProduct` muda: o cache de
// dados sobrevive a deploys e o código novo não pode ler o objeto antigo.
export const listProducts = cache(
  unstable_cache(readPublishedProducts, ["catalog:published-products:v2"], {
    revalidate: 300,
    tags: ["products"],
  }),
)

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
  return (
    snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Record<string, unknown> & { id: string })
      // Variação sem preço não é oferecida: não dá para vender "R$ 0,00".
      .filter((variant) => variant.isActive !== false && Number(variant.price ?? 0) > 0)
      .map((variant) => ({
        id: variant.id,
        sku: variant.sku as string | undefined,
        attributes: (variant.attributes as Record<string, string>) ?? {},
        priceCents: Number(variant.price ?? 0),
        stock: Number(variant.stock ?? 0),
        images: ((variant.images as string[]) ?? []).filter(Boolean),
      }))
      .sort((a, b) => a.priceCents - b.priceCents)
  )
}

/** Relacionados: mesma categoria, sem repetir o próprio produto. */
export async function listRelated(product: SiteProduct, limit = 4): Promise<SiteProduct[]> {
  const products = await listProducts()
  return products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, limit)
}
