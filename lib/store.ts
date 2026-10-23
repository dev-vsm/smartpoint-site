import "server-only"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import { firestore } from "@/lib/firebase-admin"
import { FALLBACK_STORE, type SiteStore, toSiteStore } from "@/lib/store-rules"

export type { SiteStore }

async function readStore(): Promise<SiteStore> {
  const db = firestore()
  if (!db) return FALLBACK_STORE

  const snapshot = await db.collection("settings").doc("store").get()
  return toSiteStore(snapshot.data())
}

/**
 * Mesmo esquema do catálogo (ver `lib/catalog.ts`): cache entre requisições —
 * `/produtos` renderiza por requisição — e dedupe dentro da renderização, já que
 * a página, o rodapé e o JSON-LD pedem a loja.
 */
export const getStore = cache(
  // Versão na chave: muda junto com o formato de `SiteStore` (ver `lib/catalog.ts`).
  unstable_cache(readStore, ["store:settings:v2"], { revalidate: 300, tags: ["store"] }),
)
