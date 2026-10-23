import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { PageShell } from "@/components/layout/page-shell"
import { WhatsAppCta, WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { SectionHeading } from "@/components/ui/section"
import { listNotices } from "@/lib/site-content"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"

export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: "/sobre" },
  title: "A loja — SmartPoint em Uberlândia",
  description:
    "Quiosque de acessórios para celular na Av. João Pinheiro, em Uberlândia. Atendimento rápido, no balcão e pelo WhatsApp.",
}

export default async function AboutPage() {
  const [store, notices, submenu] = await Promise.all([getStore(), listNotices(), catalogSubmenu()])

  return (
    <>
      <Header
        storeName={store.name}
        logoUrl={store.brand.logoUrl}
        notices={notices}
        whatsapp={store.whatsapp}
      />
      <PageShell submenu={submenu} className="py-8">
        <SectionHeading title="A loja" />
        <div className="max-w-prose space-y-4 text-ink-soft">
          {store.about ? (
            <p className="whitespace-pre-wrap">{store.about}</p>
          ) : (
            <>
              <p>
                A {store.name} é um quiosque de rua: acessório escolhido na hora e película colocada
                na hora. Sem vitrine fechada, sem senha de atendimento — é chegar, perguntar e
                resolver.
              </p>
              <p>
                Trabalhamos com capinhas, películas, fones, carregadores e cabos. O que não está na
                vitrine, a gente procura.
              </p>
            </>
          )}
        </div>
        <div className="mt-8">
          <WhatsAppCta number={store.whatsapp} label="Falar com a loja" className="w-auto" />
        </div>
      </PageShell>
      <Footer />
      <WhatsAppFloating number={store.whatsapp} />
    </>
  )
}
