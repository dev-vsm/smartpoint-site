"use client"

import { useState } from "react"
import { OpenNow } from "@/components/layout/open-now"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { AvailabilityLine, CTA_LABEL } from "@/components/ui/availability"
import { PriceTag } from "@/components/ui/price-tag"
import { ProductPhoto } from "@/components/ui/product-photo"
import { TrustList } from "@/components/ui/trust-list"
import { type SiteProduct, specsLabel } from "@/lib/catalog-rules"
import type { HoursSlot } from "@/lib/hours"
import { productMessage } from "@/lib/messages"
import type { TrustItem } from "@/lib/trust"
import { cn } from "@/lib/utils"

/**
 * Detalhe do produto: foto grande, preço, disponibilidade e as características
 * cadastradas no admin (cor, conector…). Cada produto é um item só — a mesma
 * capinha em outra cor é outro produto. Logo abaixo do botão, o que trava a
 * compra: horário, retirada, entrega, pagamento e garantia. No celular, preço e
 * botão ficam presos no rodapé.
 */
export function ProductDetail({
  product,
  whatsapp,
  url,
  trust,
  hours,
  installments,
}: {
  product: SiteProduct
  whatsapp: string
  url: string
  trust: TrustItem[]
  hours: HoursSlot[]
  /** "em até 12x", quando a loja parcela no cartão. */
  installments?: string
}) {
  const [photo, setPhoto] = useState(0)
  const gallery = product.media
  const current = gallery[photo] ?? gallery[0]

  const price = product.priceCents
  const availability = product.availability
  const cta = CTA_LABEL[availability]
  const message = productMessage({
    name: product.name,
    variant: specsLabel(product.specs) || undefined,
    priceCents: price,
    url,
    availability,
  })

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-md bg-paper ring-1 ring-line">
          {current ? (
            <ProductPhoto
              key={current.id}
              image={current}
              eager
              sizes="(min-width: 1024px) 45vw, 100vw"
              className={cn(
                "absolute inset-0 h-full w-full object-contain p-6",
                availability === "sold_out" && "opacity-60 grayscale",
              )}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-ink-soft">
              sem foto
            </span>
          )}
        </div>

        {gallery.length > 1 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {gallery.map((image, index) => (
              <li key={image.id}>
                <button
                  type="button"
                  aria-label={`Foto ${index + 1}`}
                  aria-current={index === photo}
                  onClick={() => setPhoto(index)}
                  className={cn(
                    "relative block h-16 w-16 overflow-hidden rounded-sm bg-paper ring-1 transition-colors",
                    index === photo ? "ring-brand-strong" : "ring-line hover:ring-brand-strong",
                  )}
                >
                  <ProductPhoto
                    image={image}
                    alt=""
                    sizes="64px"
                    className="absolute inset-0 h-full w-full object-contain p-1"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {product.category && (
          <p className="text-sm text-ink-soft">
            {[product.category, product.subcategory].filter(Boolean).join(" · ")}
          </p>
        )}
        <h1 className="mt-1 text-3xl">{product.name}</h1>

        <div className="mt-4 space-y-2">
          <PriceTag cents={price} size="lg" />
          {installments && <p className="text-sm text-ink-soft">ou {installments} no cartão</p>}
          <AvailabilityLine availability={availability} />
        </div>

        {product.specs.length > 0 && (
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            {product.specs.map((spec) => (
              <div key={spec.name} className="contents">
                <dt className="text-ink-soft">{spec.name}</dt>
                <dd className="font-semibold">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-6 space-y-3">
          <WhatsAppCta
            number={whatsapp}
            label={cta.long}
            message={message}
            source="produto"
            product={product.slug}
          />
          <OpenNow hours={hours} />
        </div>

        <TrustList items={trust} className="mt-6 border-t border-line pt-6" />

        {product.description && (
          <div className="mt-8 border-t border-line pt-6">
            <h2 className="text-lg">Sobre o produto</h2>
            <p className="mt-2 max-w-prose whitespace-pre-wrap text-sm text-ink-soft">
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Celular: o botão principal some ao rolar a descrição — este fica. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="min-w-0 shrink-0">
          <PriceTag cents={price} size="sm" />
        </div>
        <WhatsAppCta
          number={whatsapp}
          label={cta.short}
          ariaLabel={`${cta.short}: ${product.name}, pelo WhatsApp`}
          message={message}
          source="barra_produto"
          product={product.slug}
          className="flex-1"
        />
      </div>
    </div>
  )
}
