import "server-only"
import { unstable_cache } from "next/cache"
import { readAdminFeed } from "@/lib/admin-api"

/**
 * Avaliações reais da loja no Google (perfil da empresa), lidas no admin
 * (`GET /api/site/reviews`, Places API com a chave de lá). Prova de loja física para quem
 * nunca comprou aqui — sem avaliação inventada por produto. Sem configuração no admin, ou se o
 * Google falhar, a seção não aparece. Guardado por 1 dia: a nota quase não muda.
 */

export interface StoreReview {
  author: string
  authorUrl?: string
  rating: number
  text: string
  /** "há 2 semanas", como o Google escreve. */
  when: string
}

export interface StoreReviews {
  rating: number
  count: number
  url?: string
  reviews: StoreReview[]
}

/** Confere o formato que veio do admin; qualquer coisa estranha esconde a seção. */
export function toStoreReviews(value: unknown): StoreReviews | null {
  const data = (value ?? {}) as Partial<StoreReviews>
  const rating = Number(data.rating)
  const count = Number(data.count)
  if (!(rating > 0 && rating <= 5) || !(count > 0)) return null
  const reviews = (Array.isArray(data.reviews) ? data.reviews : [])
    .filter((review) => review && typeof review.text === "string" && review.text.trim())
    .map((review) => ({
      author: String(review.author ?? "Cliente do Google"),
      ...(typeof review.authorUrl === "string" && review.authorUrl.startsWith("https://")
        ? { authorUrl: review.authorUrl }
        : {}),
      rating: Number(review.rating) || 5,
      text: review.text.trim(),
      when: String(review.when ?? ""),
    }))
  return {
    rating,
    count,
    ...(typeof data.url === "string" && data.url.startsWith("https://") ? { url: data.url } : {}),
    reviews,
  }
}

async function readStoreReviews(): Promise<StoreReviews | null> {
  const feed = await readAdminFeed<{ reviews?: unknown }>("/api/site/reviews")
  return toStoreReviews(feed?.reviews)
}

const cachedReviews = unstable_cache(readStoreReviews, ["store:google-reviews:v2"], {
  revalidate: 86400,
  tags: ["reviews"],
})

/** Nota e comentários da loja, ou `null` (sem configuração ou com falha: a seção some). */
export async function getStoreReviews(): Promise<StoreReviews | null> {
  // Avaliação é enfeite: com o admin fora, a página segue sem ela (e a falha não fica 1 dia no cache).
  return cachedReviews().catch((error: unknown) => {
    console.error("[reviews] admin sem resposta", error instanceof Error ? error.message : error)
    return null
  })
}
