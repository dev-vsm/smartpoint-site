import "server-only"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import { firestore } from "@/lib/firebase-admin"
import { type HomeContent, toHomeContent } from "@/lib/home-content"
import { getStore } from "@/lib/store"
import { defaultNotices } from "@/lib/trust"

/** Ícones disponíveis para os avisos — o admin escolhe pelo nome. */
export type NoticeIcon =
  | "entrega"
  | "cartao"
  | "pix"
  | "loja"
  | "relogio"
  | "online"
  | "garantia"
  | "oferta"

export interface SiteNotice {
  text: string
  /** Linha de apoio, usada no card de oferta do topo ("Pedidos até as 17h"). */
  detail?: string
  icon?: NoticeIcon
  /** `promo` pinta de laranja (oferta); `info` é o padrão, em ciano. */
  tone?: "info" | "promo"
  href?: string
}

const ICONS: NoticeIcon[] = [
  "entrega",
  "cartao",
  "pix",
  "loja",
  "relogio",
  "online",
  "garantia",
  "oferta",
]

/**
 * Avisos da faixa do cabeçalho. Só o que a loja de fato faz — nada de promessa
 * inventada aqui: o admin edita em `siteContent/notices` (decisão D8). Sem esse
 * documento, os avisos saem de `settings/store` (entrega, cartão, link de pagamento).
 */
async function readNotices(): Promise<SiteNotice[]> {
  const db = firestore()
  if (!db) return defaultNotices(await getStore())

  const snapshot = await db.collection("siteContent").doc("notices").get()
  const items = snapshot.data()?.items
  if (!Array.isArray(items)) return defaultNotices(await getStore())

  const notices = items
    .map((item) => ({
      text: String(item?.text ?? "").trim(),
      detail:
        typeof item?.detail === "string" && item.detail.trim() ? item.detail.trim() : undefined,
      icon: ICONS.includes(item?.icon) ? (item.icon as NoticeIcon) : undefined,
      tone: item?.tone === "promo" ? ("promo" as const) : ("info" as const),
      href: typeof item?.href === "string" && item.href ? item.href : undefined,
    }))
    .filter((item) => item.text.length > 0)

  // Documento existente mas vazio significa "sem aviso", não "use o padrão".
  return items.length === 0 ? [] : notices
}

/** Cache entre requisições, como a loja e o catálogo (ver `lib/store.ts`). */
export const listNotices = cache(
  unstable_cache(readNotices, ["site-content:notices"], {
    revalidate: 300,
    tags: ["site-content"],
  }),
)

export type { HomeContent }

async function readHomeContent(): Promise<HomeContent> {
  const db = firestore()
  if (!db) return toHomeContent(undefined)
  const snapshot = await db.collection("siteContent").doc("home").get()
  return toHomeContent(snapshot.data())
}

export const getHomeContent = cache(
  unstable_cache(readHomeContent, ["site-content:home"], {
    revalidate: 300,
    tags: ["site-content"],
  }),
)
