import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { Archivo } from "next/font/google"
import "./globals.css"

// Uma família, eixo de largura variável: 400 no texto, 700 expandido nos títulos
// e nos preços — o letreiro da vitrine e a etiqueta saem da mesma fonte.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SmartPoint — Acessórios e assistência para celular em Uberlândia",
  description:
    "Capinhas, películas, fones e carregadores com preço na etiqueta. Troca de tela, bateria e mais, no quiosque da Av. João Pinheiro. Fale pelo WhatsApp.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
