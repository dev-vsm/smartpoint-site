import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/catalog/product-detail"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { ProductCard } from "@/components/ui/product-card"
import { SectionHeading } from "@/components/ui/section"
import { getProductBySlug, listProducts, listRelated, listVariants } from "@/lib/catalog"
import { catalogHref } from "@/lib/catalog-rules"
import { absolute, breadcrumbJsonLd, productJsonLd } from "@/lib/seo"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"
import { installmentsText, trustItems } from "@/lib/trust"

export const revalidate = 300

/** Todas as páginas de produto publicadas nascem estáticas. */
export async function generateStaticParams() {
  const products = await listProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Produto não encontrado" }
  return {
    title: product.seoTitle ?? product.name,
    description:
      product.seoDescription ??
      product.description?.slice(0, 160) ??
      `${product.name} na SmartPoint.`,
    openGraph: { images: product.image ? [product.image] : undefined },
  }
}

export default async function ProductPage({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [store, variants, related, submenu] = await Promise.all([
    getStore(),
    listVariants(product.id),
    listRelated(product),
    catalogSubmenu(),
  ])
  const crumbs = [
    { name: "Início", path: "/" },
    { name: "Produtos", path: "/produtos" },
    ...(product.category
      ? [{ name: product.category, path: catalogHref({ category: product.category }) }]
      : []),
    { name: product.name, path: `/produtos/${product.slug}` },
  ]

  return (
    <>
      <JsonLd data={productJsonLd(product, store)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageShell submenu={submenu} className="py-8">
        <nav aria-label="Você está em" className="mb-6 text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1
              return (
                <li key={crumb.path} className="flex min-w-0 items-center gap-1.5">
                  {last ? (
                    <span aria-current="page" className="line-clamp-1 text-ink">
                      {crumb.name}
                    </span>
                  ) : (
                    <>
                      <Link href={crumb.path} className="hover:text-brand-strong hover:underline">
                        {crumb.name}
                      </Link>
                      <span aria-hidden="true">›</span>
                    </>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <ProductDetail
          product={product}
          variants={variants}
          whatsapp={store.whatsapp}
          url={absolute(`/produtos/${product.slug}`)}
          trust={trustItems(store, { warranty: product.warranty })}
          hours={store.hours}
          installments={installmentsText(store.payment)}
        />

        {related.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="Também leva junto" />
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} whatsapp={store.whatsapp} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageShell>
      <Footer />
      {/* Espaço para a barra fixa de preço e WhatsApp não cobrir o rodapé no celular. */}
      <div aria-hidden="true" className="h-[4.5rem] md:hidden" />
    </>
  )
}
