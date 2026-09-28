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
 * Card da vitrine: a foto manda, a etiqueta de preço fica sobre ela e o nome
 * vem embaixo. Sem sombra e sem borda dupla — o produto recortado no branco já
 * é o contorno.
 */
export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group block rounded-md bg-paper ring-1 ring-line transition-colors hover:ring-ink"
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
        <PriceTag
          cents={product.priceFromCents}
          from={product.hasVariants}
          size="sm"
          align="right"
          className="absolute bottom-2 right-0"
        />
      </div>
      <div className="p-3">
        {product.category && <p className="text-xs text-ink-soft">{product.category}</p>}
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold group-hover:underline">
          {product.name}
        </p>
      </div>
    </Link>
  )
}
