import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppCta, WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { Container, SectionHeading } from "@/components/ui/section"
import { getStore } from "@/lib/store"

export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: "/sobre" },
  title: "A loja — SmartPoint em Uberlândia",
  description:
    "Quiosque de acessórios para celular na Av. João Pinheiro, em Uberlândia. Atendimento rápido, no balcão e pelo WhatsApp.",
}

export default async function AboutPage() {
  const store = await getStore()

  return (
    <>
      <Header storeName={store.name} logoUrl={store.brand.logoUrl} whatsapp={store.whatsapp} />
      <main className="py-8">
        <Container>
          <SectionHeading title="A loja" />
          <div className="max-w-prose space-y-4 text-ink-soft">
            {store.about ? (
              <p className="whitespace-pre-wrap">{store.about}</p>
            ) : (
              <>
                <p>
                  A {store.name} é um quiosque de rua: acessório escolhido na hora e película
                  colocada na hora. Sem vitrine fechada, sem senha de atendimento — é chegar,
                  perguntar e resolver.
                </p>
                <p>
                  Trabalhamos com capinhas, películas, fones, carregadores e cabos. O que não está
                  na vitrine, a gente procura.
                </p>
              </>
            )}
          </div>
          <div className="mt-8">
            <WhatsAppCta number={store.whatsapp} label="Falar com a loja" className="w-auto" />
          </div>
        </Container>
      </main>
      <Footer
        store={{
          name: store.name,
          logoUrl: store.brand.logoUrl,
          addressLine: store.addressLine,
          cityLine: store.cityLine,
          hours: store.hours,
          instagram: store.instagram,
          cnpj: store.cnpj,
        }}
      />
      <WhatsAppFloating number={store.whatsapp} />
    </>
  )
}
