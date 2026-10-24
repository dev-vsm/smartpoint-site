import Link from "next/link"
import { Pagination } from "@/components/catalog/pagination"
import { Testimonials } from "@/components/home/testimonials"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { JsonLd } from "@/components/seo/json-ld"
import { ABOVE_THE_FOLD, ProductCard } from "@/components/ui/product-card"
import { SectionHeading } from "@/components/ui/section"
import { listProducts } from "@/lib/catalog"
import {
  CATALOG_PAGE_SIZE,
  catalogHref,
  pickBestSellers,
  pickHighlights,
} from "@/lib/catalog-rules"
import { paginate } from "@/lib/pagination"
import { localBusinessJsonLd } from "@/lib/seo"
import { getHomeContent } from "@/lib/site-content"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"

/** Mais cards do que isso não cabem numa linha nem na tela mais larga. */
const FIT_ROW_MAX = 8

// Vitrine em cache, revalidada a cada 5 minutos (design doc §5).
export const revalidate = 300

export default async function Home() {
  const [store, products, submenu, home] = await Promise.all([
    getStore(),
    listProducts(),
    catalogSubmenu(),
    getHomeContent(),
  ])
  // Os mais vendidos (contador do admin); sem venda registrada, os destaques marcados à mão.
  const bestSellers = pickBestSellers(products, FIT_ROW_MAX)
  const highlights = bestSellers.length > 0 ? bestSellers : pickHighlights(products, FIT_ROW_MAX)
  // A lista da home é a página 1 do catálogo: a paginação leva às seguintes em `/produtos`.
  const firstPage = paginate(products, 1, CATALOG_PAGE_SIZE)

  return (
    <>
      <JsonLd data={localBusinessJsonLd(store)} />
      <PageShell submenu={submenu} className="py-8">
        <h1 className="sr-only">{home.hero?.title ?? `${store.name} — Acessórios para celular`}</h1>
        {highlights.length > 0 && (
          <section aria-labelledby="destaques" className="mb-10">
            <SectionHeading
              id="destaques"
              title={bestSellers.length > 0 ? "Mais vendidos" : "Em destaque"}
            />
            {/* Uma linha só, sem rolagem: mostra quantos cards couberem na largura
                (`.fit-row` em globals.css, por container query — sem JS). */}
            <div className="fit-row-wrap">
              <ul className="fit-row">
                {highlights.map((product, index) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      whatsapp={store.whatsapp}
                      sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 50vw"
                      eager={index < ABOVE_THE_FOLD}
                    />
                  </li>
                ))}
              </ul>
            </div>
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
      </PageShell>
      <Footer />
      <WhatsAppFloating number={store.whatsapp} />
    </>
  )
}
