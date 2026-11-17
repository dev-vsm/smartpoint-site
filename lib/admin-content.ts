import "server-only"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import { readAdminFeed } from "@/lib/admin-api"

/**
 * Loja, avisos do cabeçalho e conteúdo da home numa leitura só do admin
 * (`GET /api/site/content`, campos públicos de `settings/store` e `siteContent/*`).
 * `null` em cada parte = documento inexistente: quem lê usa o padrão.
 */
export interface AdminContent {
  store: Record<string, unknown> | null
  notices: unknown[] | null
  home: Record<string, unknown> | null
}

const EMPTY: AdminContent = { store: null, notices: null, home: null }

async function readContent(): Promise<AdminContent> {
  const feed = await readAdminFeed<Partial<AdminContent>>("/api/site/content")
  if (!feed) return EMPTY
  return {
    store: feed.store && typeof feed.store === "object" ? feed.store : null,
    notices: Array.isArray(feed.notices) ? feed.notices : null,
    home: feed.home && typeof feed.home === "object" ? feed.home : null,
  }
}

/**
 * Cache entre requisições por 5 minutos (a janela do ISR) — `/produtos` renderiza por
 * requisição — e dedupe dentro da renderização: página, rodapé e JSON-LD pedem a loja.
 */
export const getAdminContent = cache(
  unstable_cache(readContent, ["site:content:v1"], {
    revalidate: 300,
    tags: ["store", "site-content"],
  }),
)
