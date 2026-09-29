import Image from "next/image"
import Link from "next/link"
import { PriceTag } from "@/components/ui/price-tag"

export interface ProductCardData {
  slug: string
  name: string
  image?: string
  priceFromCents: number
  hasVariants: boolean
  category?: string
}

/**
 * Card da vitrine: foto em cima, preço à direita no início do corpo e nome
 * logo abaixo. Sem sombra e sem borda dupla.
 */
export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group block rounded-md bg-paper ring-1 ring-line transition-colors hover:ring-brand-strong"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-md bg-paper">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            className="object-contain p-3"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-ink-soft">
            sem foto
          </span>
        )}
      </div>
      <div className="pt-2 pb-3">
        <div className="mb-2 flex items-center justify-between gap-2 pl-3">
          {product.category && (
            <p className="min-w-0 wrap-break-word text-xs text-brand-strong">{product.category}</p>
          )}
          <PriceTag
            cents={product.priceFromCents}
            from={product.hasVariants}
            size="sm"
            align="right"
            className="ml-auto shrink-0 flex-col items-end whitespace-nowrap sm:flex-row sm:items-baseline"
          />
        </div>
        <div className="px-3">
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold group-hover:text-brand-strong group-hover:underline">
            {product.name}
          </p>
        </div>
      </div>
    </Link>
  )
}
