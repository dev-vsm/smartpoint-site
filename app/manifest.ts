import type { MetadataRoute } from "next"
import { getStore } from "@/lib/store"
import { brandColor } from "@/lib/store-rules"

export const revalidate = 300

/**
 * Manifest do app instalável (Android, Chrome, Edge, Windows, macOS). Nome,
 * cor e ícones saem de `settings/store` — trocar a marca não exige deploy.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const store = await getStore()
  const city = store.city ?? "Uberlândia"
  return {
    id: "/",
    name: `${store.name} — Acessórios para celular`,
    short_name: store.name,
    description: `Capinhas, películas, fones e carregadores em ${city}. Fale pelo WhatsApp.`,
    lang: "pt-BR",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: brandColor(store),
    categories: ["shopping"],
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
