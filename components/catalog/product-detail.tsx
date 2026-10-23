"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { OpenNow } from "@/components/layout/open-now"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { AvailabilityLine, CTA_LABEL } from "@/components/ui/availability"
import { PriceTag } from "@/components/ui/price-tag"
import { TrustList } from "@/components/ui/trust-list"
import type { ProductVariant } from "@/lib/catalog"
import { availabilityOf, type SiteProduct } from "@/lib/catalog-rules"
import type { HoursSlot } from "@/lib/hours"
import { productMessage } from "@/lib/messages"
import type { TrustItem } from "@/lib/trust"
import { cn } from "@/lib/utils"

/**
 * Detalhe do produto: foto grande, preço, disponibilidade e a escolha da
 * variação — que muda o preço, o botão e a mensagem que abre no WhatsApp.
 * Logo abaixo do botão, o que trava a compra: horário, retirada, entrega,
 * pagamento e garantia. No celular, preço e botão ficam presos no rodapé.
 */
export function ProductDetail({
  product,
  variants,
  whatsapp,
  url,
  trust,
  hours,
  installments,
}: {
  product: SiteProduct
  variants: ProductVariant[]
  whatsapp: string
  url: string
  trust: TrustItem[]
  hours: HoursSlot[]
  /** "em até 12x", quando a loja parcela no cartão. */
  installments?: string
}) {
  const options = useMemo(
    () =>
      variants.map((variant) => ({
        ...variant,
        availability: availabilityOf(variant.stock, product.subcategoryId),
      })),
    [variants, product.subcategoryId],
  )
  // Variação esgotada só fica clicável quando todas estão: aí o cliente ainda
  // escolhe qual quer que chegue.
  const someAvailable = options.some((option) => option.availability !== "sold_out")
  const [selectedId, setSelectedId] = useState(
    () => (options.find((option) => option.availability !== "sold_out") ?? options[0])?.id,
  )
  const [photo, setPhoto] = useState(0)

  const selected = options.find((option) => option.id === selectedId)
  const gallery = useMemo(() => {
    const images = [...(selected?.images ?? []), ...product.images]
    return [...new Set(images)].slice(0, 6)
  }, [product.images, selected])

  const price = selected?.priceCents ?? product.priceFromCents
  const label = selected ? describe(selected) : undefined
  const availability = selected?.availability ?? product.availability
  const cta = CTA_LABEL[availability]
  const message = productMessage({
    name: product.name,
    variant: label,
    priceCents: price,
    url,
    availability,
  })

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-md bg-paper ring-1 ring-line">
          {gallery[photo] ? (
            <Image
              src={gallery[photo]}
              alt={product.name}
              fill
              preload
              sizes="(min-width: 1024px) 45vw, 100vw"
              className={cn(
                "object-contain p-6",
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
          <ul className="mt-3 flex gap-2">
            {gallery.map((image, index) => (
              <li key={image}>
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
                  <Image src={image} alt="" fill sizes="64px" className="object-contain p-1" />
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

        {options.length > 1 && (
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Escolha a variação</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {options.map((option) => {
                const soldOut = option.availability === "sold_out"
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={option.id === selectedId}
                    disabled={soldOut && someAvailable}
                    onClick={() => {
                      setSelectedId(option.id)
                      setPhoto(0)
                    }}
                    className={cn(
                      "min-h-11 rounded-sm border px-3 text-sm font-semibold transition-colors",
                      option.id === selectedId
                        ? "border-brand-strong bg-brand text-brand-ink"
                        : "border-line bg-paper hover:border-brand-strong hover:bg-brand-soft",
                      soldOut && "line-through decoration-1 opacity-60",
                      "disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:bg-paper",
                    )}
                  >
                    {describe(option)}
                    {soldOut && <span className="sr-only"> (esgotado)</span>}
                  </button>
                )
              })}
            </div>
          </fieldset>
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

/** "Preto · 128 GB" — os atributos que o admin cadastrou, na ordem. */
function describe(variant: ProductVariant): string {
  const values = Object.values(variant.attributes).filter(Boolean)
  return values.length ? values.join(" · ") : (variant.sku ?? "Padrão")
}
