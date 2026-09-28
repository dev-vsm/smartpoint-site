import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { JsonLd } from "@/components/seo/json-ld"
import { ButtonLink } from "@/components/ui/button"
import { Container, SectionHeading } from "@/components/ui/section"
import { ServiceRow } from "@/components/ui/service-row"
import { serviceJsonLd } from "@/lib/seo"
import { listServices } from "@/lib/site-content"
import { getStore } from "@/lib/store"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Consertos de celular em Uberlândia",
  alternates: { canonical: "/servicos" },
  description:
    "Troca de tela, bateria, dock de carga, tampa traseira e botões. Orçamento pelo WhatsApp, no quiosque da Av. João Pinheiro.",
}

export default async function ServicesPage() {
  const [store, services] = await Promise.all([getStore(), listServices()])

  return (
    <>
      <JsonLd data={serviceJsonLd(services, store)} />
      <Header storeName={store.name} logoUrl={store.brand.logoUrl} whatsapp={store.whatsapp} />
      <main className="py-8">
        <Container>
          <SectionHeading
            title="Consertos"
            description="Diga o aparelho e o que está acontecendo. O preço e o prazo saem na conversa, depois de ver o aparelho."
            action={
              <ButtonLink href="/servicos/orcamento" className="w-full sm:w-auto">
                Pedir orçamento
              </ButtonLink>
            }
          />

          <ul className="rounded-md bg-paper px-5 ring-1 ring-line">
            {services.map((service) => (
              <ServiceRow key={service.title} service={service} whatsapp={store.whatsapp} />
            ))}
          </ul>

          <p className="mt-6 max-w-prose text-sm text-ink-soft">
            Não achou o que precisa? A gente também resolve troca de câmera, limpeza de conector e
            outros reparos —{" "}
            <Link href="/servicos/orcamento" className="font-semibold underline">
              descreva o problema
            </Link>{" "}
            que a gente responde com o orçamento.
          </p>
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
