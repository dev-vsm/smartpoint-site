import "server-only"
import { cache } from "react"
import { getAdminContent } from "@/lib/admin-content"
import { FALLBACK_STORE, type SiteStore, toSiteStore } from "@/lib/store-rules"

export type { SiteStore }

/** Dados da loja (`settings/store`, via admin); sem documento, os padrões mínimos. */
export const getStore = cache(async (): Promise<SiteStore> => {
  const { store } = await getAdminContent()
  return store ? toSiteStore(store) : FALLBACK_STORE
})
