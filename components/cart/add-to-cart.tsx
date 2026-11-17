"use client"

import { track } from "@vercel/analytics"
import Link from "next/link"
import { BagIcon } from "@/components/cart/bag-icon"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/cart"
import { cartActions, cartDrawer, useCart } from "@/lib/cart-store"
import { cn } from "@/lib/utils"

/**
 * "Adicionar ao carrinho" do produto com pronta entrega. Adicionar abre o drawer do carrinho
 * (botão flutuante) como confirmação. Só existe na página do produto: o mesmo lugar mostra
 * quantos já estão no carrinho e leva a ele.
 */
export function AddToCart({
  item,
  compact = false,
  className,
}: {
  item: Omit<CartItem, "quantity">
  /** Barra fixa do celular: rótulo curto. */
  compact?: boolean
  className?: string
}) {
  const inCart = useCart().find((entry) => entry.productId === item.productId)?.quantity ?? 0
  const full = inCart >= item.maxQuantity

  const add = () => {
    cartActions.add(item)
    cartDrawer.open()
    track("carrinho_adicionado", { produto: item.slug, preco: item.priceCents })
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        className="flex-1"
        disabled={full}
        aria-label={compact ? `Adicionar ao carrinho: ${item.name}` : undefined}
        onClick={add}
      >
        <BagIcon />
        {full
          ? "Máximo em estoque"
          : compact
            ? "Comprar"
            : inCart
              ? "Adicionar mais um"
              : "Adicionar ao carrinho"}
      </Button>
      {inCart > 0 && (
        <Link
          href="/carrinho"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-brand-strong px-3 text-sm font-semibold text-brand-strong hover:bg-brand-soft"
        >
          {compact ? `Ver (${inCart})` : `Ver carrinho (${inCart})`}
        </Link>
      )}
    </div>
  )
}
