import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { JsonLd } from "@/components/seo/json-ld"
import { ProductCard } from "@/components/ui/product-card"
import { Container, SectionHeading } from "@/components/ui/section"
import { listHighlights } from "@/lib/catalog"
import { localBusinessJsonLd } from "@/lib/seo"
import { listNotices } from "@/lib/site-content"
import { getStore } from "@/lib/store"

// Vitrine em cache, revalidada a cada 5 minutos (design doc §5).
export const revalidate = 300

export default async function Home() {
  const [store, highlights, notices] = await Promise.all([
    getStore(),
    listHighlights(),
    listNotices(),
  ])

  return (
    <>
      <JsonLd data={localBusinessJsonLd(store)} />
      <Header
        storeName={store.name}
        logoUrl={store.brand.logoUrl}
        whatsapp={store.whatsapp}
        notices={notices}
      />
      <main className="py-10">
        <Container>
          <SectionHeading
            title="Em destaque"
            description="Os acessórios que mais saem do balcão nesta semana."
          />
          {highlights.length === 0 ? (
            <p className="rounded-md bg-paper p-6 text-sm text-ink-soft ring-1 ring-line">
              Nenhum produto publicado ainda. Marque um produto para o site no admin e ele aparece
              aqui em até 5 minutos.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {highlights.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} whatsapp={store.whatsapp} />
                </li>
              ))}
            </ul>
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
