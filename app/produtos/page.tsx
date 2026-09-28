import type { Metadata } from "next"
import { CatalogBrowser } from "@/components/catalog/catalog-browser"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { Container, SectionHeading } from "@/components/ui/section"
import { listCategories, listProducts } from "@/lib/catalog"
import { getStore } from "@/lib/store"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Produtos — capinhas, películas, fones e carregadores",
  description:
    "O que tem no quiosque hoje, com preço na etiqueta. Escolha e fale com a gente pelo WhatsApp.",
}

export default async function ProductsPage() {
  const [store, products, categories] = await Promise.all([
    getStore(),
    listProducts(),
    listCategories(),
  ])

  return (
    <>
      <Header storeName={store.name} logoUrl={store.brand.logoUrl} whatsapp={store.whatsapp} />
      <main className="py-8">
        <Container>
          <SectionHeading
            title="Produtos"
            description="Preço na etiqueta. Se não achar o que precisa, chama no WhatsApp que a gente procura."
          />
          {products.length === 0 ? (
            <p className="rounded-md bg-paper p-6 text-sm text-ink-soft ring-1 ring-line">
              A vitrine está sendo montada. Enquanto isso, fale com a gente pelo WhatsApp.
            </p>
          ) : (
            <CatalogBrowser products={products} categories={categories} />
          )}
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
