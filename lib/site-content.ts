import "server-only"
import { firestore } from "@/lib/firebase-admin"

export interface ServiceItem {
  title: string
  description?: string
}

/**
 * Serviços do quiosque. O admin pode sobrescrever em `siteContent/services`;
 * sem isso, vale a lista combinada com a loja — preço e prazo saem na conversa
 * (decisão D7), então não existe campo de preço aqui.
 */
const DEFAULT_SERVICES: ServiceItem[] = [
  { title: "Troca de tela", description: "Tela trincada, manchada ou sem toque." },
  { title: "Troca de bateria", description: "Aparelho segura pouca carga ou desliga sozinho." },
  { title: "Troca de dock de carga", description: "Não carrega ou só carrega em uma posição." },
  { title: "Troca de tampa traseira", description: "Tampa trincada ou soltando." },
  { title: "Troca de botões", description: "Volume, power ou home sem resposta." },
]

export async function listServices(): Promise<ServiceItem[]> {
  const db = firestore()
  if (!db) return DEFAULT_SERVICES

  const snapshot = await db.collection("siteContent").doc("services").get()
  const items = snapshot.data()?.items
  if (!Array.isArray(items) || items.length === 0) return DEFAULT_SERVICES

  return items
    .map((item) => ({ title: String(item?.title ?? "").trim(), description: item?.description }))
    .filter((item) => item.title.length > 0)
}
