import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { Archivo } from "next/font/google"
import { InstagramBand } from "@/components/home/instagram-band"
import { RepairBanner } from "@/components/home/repair-banner"
import { StoreBanners } from "@/components/home/store-banners"
import { ConversionTracker } from "@/components/layout/conversion-tracker"
import { Header } from "@/components/layout/header"
import { RepairBannerVisibility } from "@/components/layout/repair-banner-visibility"
import { siteUrl } from "@/lib/seo"
import { getHomeContent } from "@/lib/site-content"
import { getStore } from "@/lib/store"
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
    ...(store.brand.iconUrl ? { icons: { icon: store.brand.iconUrl } } : {}),
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [store, home] = await Promise.all([getStore(), getHomeContent()])
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body>
        <Header
          storeName={store.name}
          logoUrl={store.brand.logoUrl}
          whatsapp={store.whatsapp}
          hero={home.hero}
          benefits={<StoreBanners store={store} />}
          instagram={<InstagramBand store={store} />}
        />
        <RepairBannerVisibility>
          <RepairBanner whatsapp={store.whatsapp} />
        </RepairBannerVisibility>
        {children}
        <Analytics />
        <ConversionTracker />
      </body>
    </html>
  )
}
