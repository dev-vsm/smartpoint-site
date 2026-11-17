import type { Metadata } from "next"
import Link from "next/link"
import { CartView } from "@/components/cart/cart-view"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { SectionHeading } from "@/components/ui/section"
import { checkoutEnabled } from "@/lib/admin-api"
import { getStoreReviews } from "@/lib/google-reviews"
import { getStore } from "@/lib/store"
import { installmentsText } from "@/lib/trust"

export const metadata: Metadata = {
  title: "Carrinho",
  robots: { index: false, follow: false },
}

/** O carrinho vive no navegador; daqui o servidor só manda as regras de retirada e entrega. */
export default async function CartPage() {
  const [store, reviews] = await Promise.all([getStore(), getStoreReviews()])
  const methods = store.payment.methods
  return (
    <>
      <PageShell className="py-8">
        <SectionHeading
          title="Carrinho"
          description="Confira os produtos, escolha como receber e pague no Mercado Pago."
          action={
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-brand-strong px-4 text-sm font-semibold text-brand-strong hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span aria-hidden="true">←</span>
              Continuar comprando
            </Link>
          }
        />
        <CartView
          delivery={store.delivery}
          storeCity={store.city}
          pickupAddress={store.addressLine || undefined}
          whatsapp={store.whatsapp}
          installments={installmentsText(store.payment)}
          checkoutEnabled={checkoutEnabled()}
          pix={
            methods.includes("pix_chave") ||
            methods.includes("pix_maquina") ||
            methods.includes("payment_link")
          }
          card={methods.includes("credit")}
          store={{
            name: store.name,
            city: store.city,
            legalName: store.legalName,
            cnpj: store.cnpj,
            address: [store.addressLine, store.cityLine].filter(Boolean).join(" — ") || undefined,
            photo: store.photos[0],
            rating: reviews ? { rating: reviews.rating, count: reviews.count } : undefined,
          }}
        />
      </PageShell>
      <Footer />
    </>
  )
}
