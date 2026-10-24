import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Archivo } from "next/font/google"
import { InstagramBand } from "@/components/home/instagram-band"
import { RepairBanner } from "@/components/home/repair-banner"
import { StoreBanners } from "@/components/home/store-banners"
import { ConversionTracker } from "@/components/layout/conversion-tracker"
import { Header } from "@/components/layout/header"
import { RepairBannerVisibility } from "@/components/layout/repair-banner-visibility"
import { bannerSlides } from "@/lib/repair-slides"
import { siteUrl } from "@/lib/seo"
import { getHomeContent, listNotices } from "@/lib/site-content"
import { getStore } from "@/lib/store"
import { brandColor } from "@/lib/store-rules"
import "./globals.css"

// Uma família, eixo de largura variável: 400 no texto, 700 expandido nos títulos
// e nos preços — o letreiro da vitrine e a etiqueta saem da mesma fonte.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
})

/**
 * Título, ícone e imagem de compartilhamento saem da marca cadastrada em
 * `settings/store.brand` — trocar a identidade não exige deploy (decisão D13).
 */
export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()
  const city = store.city ?? "Uberlândia"
  const title = `${store.name} — Acessórios para celular em ${city}`
  const where = store.district ? `Retire na loja no ${store.district}` : "Retire na loja"
  const description = `Capinhas, películas, fones e carregadores com preço na etiqueta. ${where} ou receba em toda ${city}. Fale pelo WhatsApp.`

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${store.name}` },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: store.name,
      title,
      description,
      url: siteUrl,
      ...(store.brand.ogImageUrl ? { images: [store.brand.ogImageUrl] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    // Ícones da aba e do app instalado: `app/icon.tsx`, `app/apple-icon.tsx` e `app/manifest.ts`.
    applicationName: store.name,
    appleWebApp: { capable: true, title: store.name, statusBarStyle: "default" },
  }
}

/** Cor da barra do navegador no celular e da janela do app instalado. */
export async function generateViewport(): Promise<Viewport> {
  return { themeColor: brandColor(await getStore()) }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [store, home, notices] = await Promise.all([getStore(), getHomeContent(), listNotices()])
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body>
        <Header
          storeName={store.name}
          whatsapp={store.whatsapp}
          hero={home.hero}
          benefits={<StoreBanners store={store} notices={notices} />}
          instagram={<InstagramBand store={store} />}
        />
        <RepairBannerVisibility>
          <RepairBanner whatsapp={store.whatsapp} slides={bannerSlides(store)} />
        </RepairBannerVisibility>
        {children}
        <Analytics />
        <ConversionTracker />
      </body>
    </html>
  )
}
