"use client"

import { track } from "@vercel/analytics"
import Link from "next/link"
import { BagIcon } from "@/components/cart/bag-icon"
import { ProductPhoto } from "@/components/ui/product-photo"
import type { CartItem } from "@/lib/cart"
import { cartActions, cartDrawer } from "@/lib/cart-store"
import type { ProductImage } from "@/lib/product-media"
import { formatPrice } from "@/lib/utils"

export interface Complement {
  id: string
  slug: string
  name: string
  priceCents: number
  cover?: ProductImage
  stock: number
  /** Garantia e compatibilidade, para o carrinho. */
  note?: string
}

/**
 * "Compre junto": complementos do mesmo modelo (película para a capinha do S24…), com o
 * atalho "Adicionar os dois" — um toque põe o produto da página e o complemento no carrinho.
 * Sem compra online, cada complemento é só um link para a página dele.
 */
export function BuyTogether({
  item,
  model,
  complements,
}: {
  /** O produto da página como item de carrinho; `null` quando não dá para comprar online. */
  item: Omit<CartItem, "quantity"> | null
  model: string
  complements: Complement[]
}) {
  if (!complements.length) return null

  return (
    <section aria-labelledby="buy-together" className="mt-8 border-t border-line pt-6">
      <h2 id="buy-together" className="text-lg">
        Compre junto
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Também servem no {model}.</p>
      <ul className="mt-3 space-y-3">
        {complements.map((complement) => (
          <li
            key={complement.id}
            className="flex items-center gap-3 rounded-md bg-paper p-3 ring-1 ring-line"
          >
            <Link
              href={`/produtos/${complement.slug}`}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-paper ring-1 ring-line"
            >
              {complement.cover && (
                <ProductPhoto
                  image={complement.cover}
                  alt=""
                  sizes="64px"
                  className="absolute inset-0 h-full w-full object-contain p-1"
                />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/produtos/${complement.slug}`}
                className="line-clamp-2 text-sm font-semibold hover:text-brand-strong hover:underline"
              >
                {complement.name}
              </Link>
              <p className="text-sm font-bold">{formatPrice(complement.priceCents)}</p>
            </div>
            {item && (
              <button
                type="button"
                onClick={() => {
                  cartActions.add(item)
                  cartActions.add({
                    productId: complement.id,
                    slug: complement.slug,
                    name: complement.name,
                    priceCents: complement.priceCents,
                    image: complement.cover?.original,
                    note: complement.note,
                    maxQuantity: complement.stock,
                  })
                  cartDrawer.open()
                  track("compre_junto", { produto: item.slug, complemento: complement.slug })
                }}
                className="inline-flex min-h-11 shrink-0 flex-col items-center justify-center rounded-sm bg-brand px-3 text-xs font-semibold leading-tight text-brand-ink hover:bg-brand-strong hover:text-paper"
              >
                <span className="inline-flex items-center gap-1">
                  <BagIcon className="h-4 w-4" />
                  Adicionar os dois
                </span>
                <span className="font-bold">
                  {formatPrice(item.priceCents + complement.priceCents)}
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
