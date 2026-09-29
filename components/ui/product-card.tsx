import Image from "next/image"
import Link from "next/link"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { PriceTag } from "@/components/ui/price-tag"
import { productMessage } from "@/lib/messages"
import { absolute } from "@/lib/seo"

export interface ProductCardData {
  slug: string
  name: string
  image?: string
  priceFromCents: number
  hasVariants: boolean
  category?: string
}

/**
 * Card da vitrine: foto em cima, preço à direita no início do corpo, nome
 * logo abaixo e, no rodapé, o atalho para o WhatsApp já falando deste produto.
 * O link do card e o do rodapé são irmãos — âncora dentro de âncora não existe.
 */
export function ProductCard({ product, whatsapp }: { product: ProductCardData; whatsapp: string }) {
  const message = productMessage({
    name: product.name,
    // Com variação o preço da etiqueta é "a partir de": não promete valor na mensagem.
    priceCents: product.hasVariants ? undefined : product.priceFromCents,
    url: absolute(`/produtos/${product.slug}`),
  })

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md bg-paper ring-1 ring-line transition-colors hover:ring-brand-strong">
      <Link href={`/produtos/${product.slug}`} className="group block grow">
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
              <p className="min-w-0 wrap-break-word text-xs text-brand-strong">
                {product.category}
              </p>
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

      {/* O botão é o rodapé: encosta nas bordas e o card recorta os cantos. */}
      <WhatsAppCta
        number={whatsapp}
        message={message}
        label="Quero esse"
        ariaLabel={`Falar no WhatsApp sobre ${product.name}`}
        className="min-h-10! w-full! rounded-none!"
      />
    </article>
  )
}
