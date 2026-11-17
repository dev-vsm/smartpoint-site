import "server-only"
import { cache } from "react"
import { getAdminContent } from "@/lib/admin-content"
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
  const items = (await getAdminContent()).notices
  if (!Array.isArray(items)) return defaultNotices(await getStore())

  // Formato conferido campo a campo (o admin já manda só estes campos).
  const notices = items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
    .map((item) => ({
      text: typeof item.text === "string" ? item.text.trim() : "",
      detail:
        typeof item.detail === "string" && item.detail.trim() ? item.detail.trim() : undefined,
      icon: ICONS.includes(item.icon as NoticeIcon) ? (item.icon as NoticeIcon) : undefined,
      tone: item.tone === "promo" ? ("promo" as const) : ("info" as const),
      href: typeof item.href === "string" && item.href ? item.href : undefined,
    }))
    .filter((item) => item.text.length > 0)

  // Documento existente mas vazio significa "sem aviso", não "use o padrão".
  return items.length === 0 ? [] : notices
}

/** O cache entre requisições é o de `getAdminContent`; aqui só o dedupe da renderização. */
export const listNotices = cache(readNotices)

export type { HomeContent }

export const getHomeContent = cache(
  async (): Promise<HomeContent> => toHomeContent((await getAdminContent()).home ?? undefined),
)
