import "server-only"
import { firestore } from "@/lib/firebase-admin"

/** Ícones disponíveis para os avisos — o admin escolhe pelo nome. */
export type NoticeIcon = "entrega" | "cartao" | "pix" | "loja" | "relogio"

export interface SiteNotice {
  text: string
  icon?: NoticeIcon
  /** `promo` pinta de laranja (oferta); `info` é o padrão, em ciano. */
  tone?: "info" | "promo"
  href?: string
}

const ICONS: NoticeIcon[] = ["entrega", "cartao", "pix", "loja", "relogio"]

/**
 * Avisos da faixa do cabeçalho. Só o que a loja de fato faz — nada de promessa
 * inventada aqui: o admin edita em `siteContent/notices` (decisão D8).
 */
const DEFAULT_NOTICES: SiteNotice[] = [
  { text: "Fazemos entrega", icon: "entrega" },
  { text: "Parcelamos no cartão", icon: "cartao" },
]

export async function listNotices(): Promise<SiteNotice[]> {
  const db = firestore()
  if (!db) return DEFAULT_NOTICES

  const snapshot = await db.collection("siteContent").doc("notices").get()
  const items = snapshot.data()?.items
  if (!Array.isArray(items)) return DEFAULT_NOTICES

  const notices = items
    .map((item) => ({
      text: String(item?.text ?? "").trim(),
      icon: ICONS.includes(item?.icon) ? (item.icon as NoticeIcon) : undefined,
      tone: item?.tone === "promo" ? ("promo" as const) : ("info" as const),
      href: typeof item?.href === "string" && item.href ? item.href : undefined,
    }))
    .filter((item) => item.text.length > 0)

  // Documento existente mas vazio significa "sem aviso", não "use o padrão".
  return items.length === 0 ? [] : notices
}
