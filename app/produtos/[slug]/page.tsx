import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/catalog/product-detail"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { ProductCard } from "@/components/ui/product-card"
import { Container, SectionHeading } from "@/components/ui/section"
import { getProductBySlug, listProducts, listRelated, listVariants } from "@/lib/catalog"
import { getStore } from "@/lib/store"

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

  const [store, variants, related] = await Promise.all([
    getStore(),
    listVariants(product.id),
    listRelated(product),
  ])
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""

  return (
    <>
      <Header storeName={store.name} logoUrl={store.brand.logoUrl} whatsapp={store.whatsapp} />
      <main className="py-8">
        <Container>
          <nav aria-label="Você está em" className="mb-6 text-sm text-ink-soft">
            <Link href="/produtos" className="hover:underline">
              Produtos
            </Link>
            {product.category && <span> · {product.category}</span>}
          </nav>

          <ProductDetail
            product={product}
            variants={variants}
            whatsapp={store.whatsapp}
            url={`${siteUrl}/produtos/${product.slug}`}
          />

          {related.length > 0 && (
            <section className="mt-16">
              <SectionHeading title="Também leva junto" />
              <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {related.map((item) => (
                  <li key={item.id}>
                    <ProductCard product={item} />
                  </li>
                ))}
              </ul>
            </section>
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
