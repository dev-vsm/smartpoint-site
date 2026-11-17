import "server-only"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import {
  collectCategories,
  hasPrice,
  isPublished,
  pickComplements,
  pickRawProduct,
  type RawProduct,
  type SiteProduct,
  sortForShowcase,
  toSiteProduct,
} from "@/lib/catalog-rules"
import { firestore } from "@/lib/firebase-admin"

/**
 * Leitura do catálogo publicado. Uma consulta por `site.published` e o resto
 * filtrado em memória — evita índice composto no Firestore para um catálogo
 * desta ordem de grandeza (centenas de itens). Devolve só os campos usados
 * (`pickRawProduct`), para caber no cache de dados.
 */
async function readPublishedDocs(): Promise<RawProduct[]> {
  const db = firestore()
  if (!db) return []

  const snapshot = await db.collection("Products").where("site.published", "==", true).get()
  return snapshot.docs.map((doc) => pickRawProduct(doc.id, doc.data())).filter(isPublished)
}

/**
 * Duas camadas de cache:
 * - `unstable_cache` guarda os documentos entre requisições por 5 minutos (a mesma
 *   janela do ISR). Sem ele, `/produtos` — que renderiza por requisição por
 *   causa de `?pagina=` e `?q=` — e cada página de produto no build leriam o
 *   Firestore inteiro. O item tem limite de 2 MB: por isso guarda os campos crus,
 *   não o `SiteProduct` (as URLs de foto do `srcset` o deixavam com mais de 2 MB).
 * - `cache` do React dedupa dentro de uma renderização e monta o `SiteProduct`
 *   uma vez: a página e o menu de categorias pedem o catálogo, mas a leitura e a
 *   montagem acontecem uma vez.
 *
 * `unstable_cache` é o caminho do Next 16 sem Cache Components; ao migrar para
 * `cacheComponents`, ele vira a diretiva `"use cache"` com `cacheLife`.
 */
// A versão na chave muda quando o formato guardado muda: o cache de dados
// sobrevive a deploys e o código novo não pode ler o objeto antigo.
const readCachedDocs = unstable_cache(readPublishedDocs, ["catalog:published-docs:v1"], {
  revalidate: 300,
  tags: ["products"],
})

export const listProducts = cache(async (): Promise<SiteProduct[]> => {
  const products = (await readCachedDocs())
    .map((product) => toSiteProduct(product))
    .filter(hasPrice)
  return sortForShowcase(products)
})

export async function listCategories() {
  return collectCategories(await listProducts())
}

export async function getProductBySlug(slug: string): Promise<SiteProduct | null> {
  const products = await listProducts()
  return products.find((product) => product.slug === slug) ?? null
}

/** Relacionados: mesma categoria, sem repetir o próprio produto. */
export async function listRelated(product: SiteProduct, limit = 4): Promise<SiteProduct[]> {
  const products = await listProducts()
  return products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, limit)
}

/** "Compre junto": complementos do mesmo modelo, de outra categoria (ver `pickComplements`). */
export async function listComplements(product: SiteProduct, limit = 2): Promise<SiteProduct[]> {
  return pickComplements(product, await listProducts(), limit)
}
