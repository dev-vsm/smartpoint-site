"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { PriceTag } from "@/components/ui/price-tag"
import type { ProductVariant } from "@/lib/catalog"
import type { SiteProduct } from "@/lib/catalog-rules"
import { productMessage } from "@/lib/messages"
import { cn } from "@/lib/utils"

/**
 * Detalhe do produto: foto grande, etiqueta de preço e a escolha da variação —
 * que muda o preço e a mensagem que abre no WhatsApp.
 */
export function ProductDetail({
  product,
  variants,
  whatsapp,
  url,
}: {
  product: SiteProduct
  variants: ProductVariant[]
  whatsapp: string
  url: string
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id)
  const [photo, setPhoto] = useState(0)

  const selected = variants.find((variant) => variant.id === selectedId)
  const gallery = useMemo(() => {
    const images = [...(selected?.images ?? []), ...product.images]
    return [...new Set(images)].slice(0, 6)
  }, [product.images, selected])

  const price = selected?.priceCents ?? product.priceFromCents
  const label = selected ? describe(selected) : undefined
  const inStock = selected ? selected.stock > 0 : product.available

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-md bg-paper ring-1 ring-line">
          {gallery[photo] ? (
            <Image
              src={gallery[photo]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-contain p-6"
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
                    index === photo ? "ring-ink" : "ring-line hover:ring-ink-soft",
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
        {product.category && <p className="text-sm text-ink-soft">{product.category}</p>}
        <h1 className="mt-1 text-3xl">{product.name}</h1>

        <div className="mt-4">
          <PriceTag cents={price} size="lg" />
          {!inStock && (
            <p className="mt-2 text-sm text-ink-soft">
              Acabou no balcão — pergunte pelo WhatsApp que a gente avisa quando chegar.
            </p>
          )}
        </div>

        {variants.length > 1 && (
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Escolha a variação</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={variant.id === selectedId}
                  onClick={() => {
                    setSelectedId(variant.id)
                    setPhoto(0)
                  }}
                  className={cn(
                    "min-h-11 rounded-sm border px-3 text-sm font-semibold transition-colors",
                    variant.id === selectedId
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-paper hover:border-ink",
                    variant.stock === 0 && "opacity-60",
                  )}
                >
                  {describe(variant)}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-6">
          <WhatsAppCta
            number={whatsapp}
            label="Quero esse — falar no WhatsApp"
            message={productMessage({ name: product.name, variant: label, priceCents: price, url })}
          />
        </div>

        {product.description && (
          <div className="mt-8 border-t border-line pt-6">
            <h2 className="text-lg">Sobre o produto</h2>
            <p className="mt-2 max-w-prose whitespace-pre-wrap text-sm text-ink-soft">
              {product.description}
            </p>
          </div>
        )}

        {product.warranty && (
          <p className="mt-4 text-sm text-ink-soft">Garantia: {product.warranty}</p>
        )}
      </div>
    </div>
  )
}

/** "Preto · 128 GB" — os atributos que o admin cadastrou, na ordem. */
function describe(variant: ProductVariant): string {
  const values = Object.values(variant.attributes).filter(Boolean)
  return values.length ? values.join(" · ") : (variant.sku ?? "Padrão")
}
