import Link from "next/link"
import { Pagination } from "@/components/catalog/pagination"
import { Hero } from "@/components/home/hero"
import { InstagramBand } from "@/components/home/instagram-band"
import { Testimonials } from "@/components/home/testimonials"
import { VisitStore } from "@/components/home/visit-store"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { PageShell } from "@/components/layout/page-shell"
import { WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { JsonLd } from "@/components/seo/json-ld"
import { ABOVE_THE_FOLD, ProductCard } from "@/components/ui/product-card"
import { SectionHeading } from "@/components/ui/section"
import { TrustList } from "@/components/ui/trust-list"
import { listProducts } from "@/lib/catalog"
import { CATALOG_PAGE_SIZE, catalogHref, pickHighlights } from "@/lib/catalog-rules"
import { paginate } from "@/lib/pagination"
import { localBusinessJsonLd } from "@/lib/seo"
import { getHomeContent, listNotices } from "@/lib/site-content"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"
import { trustItems } from "@/lib/trust"

// Vitrine em cache, revalidada a cada 5 minutos (design doc §5).
export const revalidate = 300

export default async function Home() {
  const [store, products, notices, submenu, home] = await Promise.all([
    getStore(),
    listProducts(),
    listNotices(),
    catalogSubmenu(),
    getHomeContent(),
  ])
  const highlights = pickHighlights(products)
  // A lista da home é a página 1 do catálogo: a paginação leva às seguintes em `/produtos`.
  const firstPage = paginate(products, 1, CATALOG_PAGE_SIZE)

  return (
    <>
      <JsonLd data={localBusinessJsonLd(store)} />
      <Header
        storeName={store.name}
        logoUrl={store.brand.logoUrl}
        notices={notices}
        whatsapp={store.whatsapp}
      />
      <PageShell submenu={submenu} className="py-8">
        <Hero hero={home.hero} store={store} />
        <TrustList items={trustItems(store)} variant="bar" className="mb-10" />

        {highlights.length > 0 && (
          <section aria-labelledby="destaques" className="mb-10">
            <SectionHeading
              id="destaques"
              title="Em destaque"
              description="Os acessórios que mais saem do balcão nesta semana."
            />
            {/* Faixa que rola de lado só com CSS: sem JS na home. No celular ela
                encosta nas bordas da tela para deixar claro que continua. */}
            <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2">
              {highlights.map((product, index) => (
                <li key={product.id} className="w-44 shrink-0 snap-start sm:w-52">
                  <ProductCard
                    product={product}
                    whatsapp={store.whatsapp}
                    sizes="(min-width: 640px) 208px, 176px"
                    eager={index < ABOVE_THE_FOLD}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="produtos">
          <SectionHeading
            id="produtos"
            title="Produtos"
            action={
              products.length > CATALOG_PAGE_SIZE && (
                <Link
                  href="/produtos"
                  className="text-sm font-semibold text-brand-strong hover:underline"
                >
                  Ver todos ({products.length})
                </Link>
              )
            }
          />
          {!firstPage || firstPage.totalItems === 0 ? (
            <p className="rounded-md bg-paper p-6 text-sm text-ink-soft ring-1 ring-line">
              Nenhum produto publicado ainda. Marque um produto para o site no admin e ele aparece
              aqui em até 5 minutos.
            </p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {firstPage.items.map((product, index) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      whatsapp={store.whatsapp}
                      eager={index < ABOVE_THE_FOLD}
                    />
                  </li>
                ))}
              </ul>
              <Pagination
                page={firstPage}
                href={(page) => catalogHref({ page })}
                className="mt-8"
              />
            </>
          )}
        </section>

        <Testimonials items={home.testimonials} />
        <VisitStore store={store} className="mt-14" />
        <InstagramBand store={store} />
      </PageShell>
      <Footer />
      <WhatsAppFloating number={store.whatsapp} />
    </>
  )
}
