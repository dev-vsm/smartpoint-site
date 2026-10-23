import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Pagination } from "@/components/catalog/pagination"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { PageShell } from "@/components/layout/page-shell"
import { WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { ButtonLink } from "@/components/ui/button"
import { ABOVE_THE_FOLD, ProductCard } from "@/components/ui/product-card"
import { listProducts } from "@/lib/catalog"
import { CATALOG_PAGE_SIZE, catalogHref, filterProducts } from "@/lib/catalog-rules"
import { paginate, parsePage } from "@/lib/pagination"
import { listNotices } from "@/lib/site-content"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"

export const revalidate = 300

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/** Lê os filtros da URL. Parâmetro repetido (`?q=a&q=b`) vale o primeiro. */
async function readFilters(searchParams: SearchParams) {
  const params = await searchParams
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
  return {
    category: first(params.categoria)?.trim() || null,
    query: first(params.q)?.trim() ?? "",
    page: parsePage(params.pagina),
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const { category, query, page } = await readFilters(searchParams)
  const base = category
    ? `Produtos: ${category}`
    : "Produtos — capinhas, películas, fones e carregadores"
  const title = page && page > 1 ? `${base} — página ${page}` : base

  return {
    title,
    description:
      "O que tem na loja hoje, com preço na etiqueta. Escolha e fale com a gente pelo WhatsApp.",
    // Cada página da categoria é canônica de si mesma; a busca não entra no
    // índice (resultado volátil), mas os links dela são seguidos.
    alternates: { canonical: catalogHref({ category, page: page ?? 1 }) },
    ...(query && { robots: { index: false, follow: true } }),
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ category, query, page }, store, products, submenu, notices] = await Promise.all([
    readFilters(searchParams),
    getStore(),
    listProducts(),
    catalogSubmenu(),
    listNotices(),
  ])

  if (page === null) notFound()
  const result = paginate(filterProducts(products, { category, query }), page, CATALOG_PAGE_SIZE)
  // Página além da última: 404, não uma página vazia indexável.
  if (!result) notFound()

  const href = (target: number) => catalogHref({ category, query, page: target })

  return (
    <>
      <Header
        storeName={store.name}
        logoUrl={store.brand.logoUrl}
        notices={notices}
        whatsapp={store.whatsapp}
      />
      <PageShell submenu={submenu} className="py-8">
        <h1 className="mb-5 text-2xl first-letter:uppercase">{category ?? "Todos os produtos"}</h1>
        {query && (
          <p className="-mt-3 mb-5 text-sm text-ink-soft">
            Resultados para <strong className="text-ink">{query}</strong>
          </p>
        )}

        {products.length === 0 ? (
          <p className="rounded-md bg-paper p-6 text-sm text-ink-soft ring-1 ring-line">
            A vitrine está sendo montada. Enquanto isso, fale com a gente pelo WhatsApp.
          </p>
        ) : result.totalItems === 0 ? (
          <div className="rounded-md bg-paper p-6 ring-1 ring-line">
            <p className="text-sm">Nada encontrado com esse filtro.</p>
            <ButtonLink href="/produtos" variant="outline" className="mt-3">
              Ver todos os produtos
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {result.items.map((product, index) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    whatsapp={store.whatsapp}
                    eager={index < ABOVE_THE_FOLD}
                  />
                </li>
              ))}
            </ul>
            <Pagination page={result} href={href} className="mt-8" />
          </>
        )}
      </PageShell>
      <Footer />
      <WhatsAppFloating number={store.whatsapp} />
    </>
  )
}
