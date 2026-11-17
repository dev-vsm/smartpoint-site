"use client"

import { track } from "@vercel/analytics"
import Image from "next/image"
import { type ReactNode, useEffect } from "react"
import { AddToCart } from "@/components/cart/add-to-cart"
import { BuyTogether, type Complement } from "@/components/catalog/buy-together"
import { Compatibility } from "@/components/catalog/compatibility"
import { DeliveryEstimator } from "@/components/catalog/delivery-estimator"
import { ProductGallery } from "@/components/catalog/product-gallery"
import { OpenNow } from "@/components/layout/open-now"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { AvailabilityLine, CTA_LABEL } from "@/components/ui/availability"
import { DeliveryPromiseBadge, DeliveryPromiseShort } from "@/components/ui/delivery-promise"
import { Installment, SoldPill } from "@/components/ui/offer-pills"
import { PriceTag } from "@/components/ui/price-tag"
import { TrustList } from "@/components/ui/trust-list"
import { cartNote, type SiteProduct, specsLabel } from "@/lib/catalog-rules"
import type { HoursSlot } from "@/lib/hours"
import { productMessage } from "@/lib/messages"
import type { StorePhoto } from "@/lib/store-rules"
import type { InstallmentOffer, TrustItem } from "@/lib/trust"

/** Loja física perto do botão: foto da fachada, bairro e garantia. */
export interface StoreProof {
  place?: string
  warranty?: string
  photo?: StorePhoto
}

/**
 * Página do produto, montada para converter:
 * - acima da dobra: nome, "+50 vendidos", preço com a parcela, "Receba hoje", compatibilidade,
 *   carrinho, frete calculado na hora e a prova de loja física;
 * - abaixo: confiança, avaliações reais da loja no Google, "Compre junto" (complementos do
 *   mesmo modelo) e a descrição com a tabela de características.
 * No celular, preço, prazo e botão ficam presos no rodapé.
 */
export function ProductDetail({
  product,
  whatsapp,
  url,
  trust,
  hours,
  installment,
  sold,
  model,
  complements = [],
  canEstimate = false,
  storeProof,
  reviews,
  sellsOnline = false,
}: {
  product: SiteProduct
  whatsapp: string
  url: string
  trust: TrustItem[]
  hours: HoursSlot[]
  /** Parcela calculada para este preço ("3x de R$ 19,97 sem juros"). */
  installment?: InstallmentOffer | null
  /** "+50 vendidos", quando passa do mínimo. */
  sold?: string
  /** Modelo/compatibilidade ("Galaxy S24"), quando cadastrado. */
  model?: string
  complements?: Complement[]
  /** Calculadora de frete: compra online e entrega ligadas. */
  canEstimate?: boolean
  storeProof?: StoreProof
  /** Nota da loja no Google (resumo, perto do botão) e a seção completa (embaixo). */
  reviews?: { summary: ReactNode; section: ReactNode }
  /** Compra online ligada (checkout do Mercado Pago): pronta entrega ganha o carrinho. */
  sellsOnline?: boolean
}) {
  const price = product.priceCents
  const availability = product.availability
  const inStock = availability === "in_stock"
  const cta = CTA_LABEL[availability]
  // Só pronta entrega vai para o carrinho: encomenda e esgotado continuam no WhatsApp.
  const cartItem =
    sellsOnline && inStock && product.stock > 0
      ? {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: price,
          // A original sempre existe; as variantes do Storage podem ainda não ter sido geradas.
          image: product.cover?.original,
          note: cartNote(product, storeProof?.warranty),
          maxQuantity: product.stock,
        }
      : null
  const message = productMessage({
    name: product.name,
    variant: specsLabel(product.specs) || undefined,
    priceCents: price,
    url,
    availability,
  })

  // Funil: produto visto (o carrinho e o checkout registram os passos seguintes).
  useEffect(() => {
    track("produto_visto", { produto: product.slug, disponibilidade: availability })
  }, [product.slug, availability])

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-6 lg:gap-8">
      <ProductGallery
        media={product.media}
        name={product.name}
        soldOut={availability === "sold_out"}
      />

      <div>
        {product.category && (
          <p className="text-sm text-ink-soft">
            {[product.category, product.subcategory].filter(Boolean).join(" · ")}
          </p>
        )}
        <h1 className="mt-1 text-3xl">{product.name}</h1>
        {sold && <SoldPill text={sold} className="mt-2" />}

        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <PriceTag cents={price} size="lg" />
            {inStock && <DeliveryPromiseBadge />}
          </div>
          {installment && <Installment offer={installment} size="lg" />}
          <AvailabilityLine availability={availability} />
        </div>

        {model && (
          <div className="mt-6">
            <Compatibility model={model} />
          </div>
        )}

        <div className="mt-6 space-y-3">
          {cartItem && <AddToCart item={cartItem} />}
          <WhatsAppCta
            number={whatsapp}
            label={cta.long}
            message={message}
            source="produto"
            product={product.slug}
          />
          <OpenNow hours={hours} />
        </div>

        {canEstimate && inStock && <DeliveryEstimator className="mt-4" />}

        {storeProof && (storeProof.place || storeProof.warranty) && (
          <div className="mt-4 flex items-center gap-3 rounded-md p-3 ring-1 ring-line">
            {storeProof.photo && (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-shelf">
                <Image
                  src={storeProof.photo.url}
                  alt={storeProof.photo.alt ?? "Fachada da loja"}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 text-sm">
              {storeProof.place && (
                <p>
                  <strong>Loja física</strong> no {storeProof.place}
                </p>
              )}
              {storeProof.warranty && (
                <p className="text-ink-soft">Garantia de {storeProof.warranty}</p>
              )}
              {reviews?.summary}
            </div>
          </div>
        )}

        <TrustList items={trust} className="mt-6 border-t border-line pt-6" />

        {reviews?.section}

        {model && <BuyTogether item={cartItem} model={model} complements={complements} />}

        {(product.specs.length > 0 || product.description) && (
          <section aria-labelledby="about-product" className="mt-8 border-t border-line pt-6">
            <h2 id="about-product" className="text-lg">
              Sobre o produto
            </h2>
            {product.specs.length > 0 && (
              <table className="mt-3 w-full max-w-prose text-sm">
                <caption className="sr-only">Características</caption>
                <tbody>
                  {product.specs.map((spec) => (
                    <tr key={spec.name} className="border-b border-line last:border-0">
                      <th
                        scope="row"
                        className="w-2/5 py-2 pr-4 text-left font-normal text-ink-soft"
                      >
                        {spec.name}
                      </th>
                      <td className="py-2 font-semibold">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {product.description && (
              <p className="mt-4 max-w-prose whitespace-pre-wrap text-sm text-ink-soft">
                {product.description}
              </p>
            )}
          </section>
        )}
      </div>

      {/* Celular: o botão principal some ao rolar a descrição — este fica, com o prazo. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="min-w-0 shrink-0">
          <PriceTag cents={price} size="sm" />
          {inStock && <DeliveryPromiseShort className="mt-0.5" />}
        </div>
        {cartItem ? (
          <>
            <AddToCart item={cartItem} compact className="flex-1" />
            <WhatsAppCta
              number={whatsapp}
              label={<span className="sr-only">WhatsApp</span>}
              ariaLabel={`Perguntar sobre ${product.name} no WhatsApp`}
              message={message}
              source="barra_produto"
              product={product.slug}
              className="w-auto! shrink-0 px-3"
            />
          </>
        ) : (
          <WhatsAppCta
            number={whatsapp}
            label={cta.short}
            ariaLabel={`${cta.short}: ${product.name}, pelo WhatsApp`}
            message={message}
            source="barra_produto"
            product={product.slug}
            className="flex-1"
          />
        )}
      </div>
    </div>
  )
}
