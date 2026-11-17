import "server-only"
import { unstable_cache } from "next/cache"

/**
 * Avaliações reais da loja no Google (perfil da empresa), pela Places API (New). Prova de loja
 * física para quem nunca comprou aqui — sem avaliação inventada por produto. Precisa de
 * `GOOGLE_PLACES_API_KEY` (só servidor, Places API ativa) e `GOOGLE_PLACE_ID`; sem elas, ou se o
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

const PLACES_URL = "https://places.googleapis.com/v1/places/"
const TIMEOUT_MS = 8000
/** Comentários mostrados: os do Google com nota 4 ou 5 e com texto, no máximo 3. */
const MAX_REVIEWS = 3

interface PlaceResponse {
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: Array<{
    rating?: number
    text?: { text?: string }
    relativePublishTimeDescription?: string
    authorAttribution?: { displayName?: string; uri?: string }
  }>
}

/** Resposta do Google → o que a página mostra (função pura, testada). */
export function toStoreReviews(data: PlaceResponse): StoreReviews | null {
  const rating = Number(data.rating)
  const count = Number(data.userRatingCount)
  if (!(rating > 0) || !(count > 0)) return null
  const reviews = (data.reviews ?? [])
    .filter((review) => Number(review.rating) >= 4 && review.text?.text?.trim())
    .slice(0, MAX_REVIEWS)
    .map((review) => ({
      author: review.authorAttribution?.displayName?.trim() || "Cliente do Google",
      ...(review.authorAttribution?.uri ? { authorUrl: review.authorAttribution.uri } : {}),
      rating: Number(review.rating),
      text: (review.text?.text ?? "").trim(),
      when: review.relativePublishTimeDescription ?? "",
    }))
  return {
    rating: Math.round(rating * 10) / 10,
    count,
    ...(data.googleMapsUri ? { url: data.googleMapsUri } : {}),
    reviews,
  }
}

export async function fetchStoreReviews(
  env: Record<string, string | undefined> = process.env,
  fetcher: typeof fetch = fetch,
): Promise<StoreReviews | null> {
  const key = env.GOOGLE_PLACES_API_KEY?.trim()
  const placeId = env.GOOGLE_PLACE_ID?.trim()
  if (!key || !placeId) return null
  try {
    const response = await fetcher(
      `${PLACES_URL}${encodeURIComponent(placeId)}?languageCode=pt-BR`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    )
    if (!response.ok) {
      console.error("[reviews] Google Places respondeu", response.status)
      return null
    }
    return toStoreReviews((await response.json()) as PlaceResponse)
  } catch (error) {
    console.error(
      "[reviews] Google Places sem resposta",
      error instanceof Error ? error.name : error,
    )
    return null
  }
}

export const getStoreReviews = unstable_cache(
  () => fetchStoreReviews(),
  ["store:google-reviews:v1"],
  {
    revalidate: 86400,
    tags: ["reviews"],
  },
)
