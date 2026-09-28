import type { Metadata } from "next"
import { QuoteForm } from "@/components/catalog/quote-form"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Container, SectionHeading } from "@/components/ui/section"
import { listServices } from "@/lib/site-content"
import { getStore } from "@/lib/store"

export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: "/servicos/orcamento" },
  title: "Pedir orçamento de conserto",
  description:
    "Conte o aparelho e o problema. O pedido abre no WhatsApp com tudo preenchido e a gente responde com preço e prazo.",
}

export default async function QuotePage() {
  const [store, services] = await Promise.all([getStore(), listServices()])

  return (
    <>
      <Header storeName={store.name} logoUrl={store.brand.logoUrl} whatsapp={store.whatsapp} />
      <main className="py-8">
        <Container>
          <SectionHeading
            title="Pedir orçamento"
            description="Três campos e o WhatsApp abre com o pedido escrito. Preço e prazo a gente responde na conversa."
          />
          <QuoteForm
            services={services.map((service) => service.title)}
            whatsapp={store.whatsapp}
          />
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
    </>
  )
}
