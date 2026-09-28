import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" })

// Metadata definitiva (título, ícone e og:image vindos da marca no banco) entra
// na Etapa 7; aqui fica o mínimo para o site não subir sem identificação.
export const metadata: Metadata = {
  title: "SmartPoint — Acessórios e assistência técnica em Uberlândia",
  description:
    "Capinhas, películas e acessórios para celular, e assistência técnica com troca de tela, bateria e mais. Atendimento pelo WhatsApp.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
