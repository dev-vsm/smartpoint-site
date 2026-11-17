import Link from "next/link"
import { AvailabilityTag } from "@/components/ui/availability"
import { DeliveryPromiseBadge } from "@/components/ui/delivery-promise"
import { Installment, SoldPill } from "@/components/ui/offer-pills"
import { PriceTag } from "@/components/ui/price-tag"
import { ProductPhoto } from "@/components/ui/product-photo"
import { type Availability, cardChips, type ProductSpec } from "@/lib/catalog-rules"
import type { ProductImage } from "@/lib/product-media"
import { getStore } from "@/lib/store"
import { installmentOffer, proofBadge } from "@/lib/trust"
import { cn } from "@/lib/utils"

/** Cards da primeira linha da grade no desktop: os que aparecem sem rolar. */
export const ABOVE_THE_FOLD = 4

export interface ProductCardData {
  slug: string
  name: string
  /** Capa do produto (`media[0]`). */
  cover?: ProductImage
  priceCents: number
  availability: Availability
  /** Características (`Cor: Preto`, `Conector: USB-C`): viram a linha de compatibilidade. */
  specs?: ProductSpec[]
  /** Vendidos: vira "+50 vendidos" a partir de 10. */
  totalSold?: number
}

/**
 * Card da vitrine: foto em cima; no corpo, o prazo à esquerda ("Receba hoje", para pronta
 * entrega; "Sob encomenda"/"Esgotado" discretos) e o preço à direita, o nome, a parcela
 * (cartão + "3x de R$ 19,97" + pílula "sem juros") e, preso ao fim do card, os chips de
 * características à esquerda e, a partir de 10 vendas, "+50 vendidos" sempre no canto inferior
 * direito. Sem selo de escassez (ver `proofBadge`). O card inteiro é um link para a página
 * do produto — sem "Adicionar" nem WhatsApp aqui, de propósito: a compra e a conversa
 * começam na página do produto, onde estão fotos, descrição e compatibilidade.
 */
export async function ProductCard({
  product,
  sizes = "(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw",
  eager = false,
}: {
  product: ProductCardData
  /** Largura da foto; muda quando o card não está na grade (ex.: faixa de destaques). */
  sizes?: string
  /**
   * Card visível já na abertura da página: a foto pode ser o LCP, então carrega
   * na hora em vez de esperar a rolagem. Use só na primeira linha da lista.
   */
  eager?: boolean
}) {
  const soldOut = product.availability === "sold_out"
  const { payment } = await getStore()
  const installment = soldOut ? null : installmentOffer(product.priceCents, payment)
  const chips = cardChips(product.specs ?? [], product.name)
  const proof = proofBadge({ totalSold: product.totalSold ?? 0 })

  return (
    <article className="product-card flex h-full flex-col overflow-hidden rounded-md bg-paper ring-1 ring-line transition-colors hover:ring-brand-strong">
      <Link href={`/produtos/${product.slug}`} className="group flex grow flex-col">
        <div className="relative aspect-square overflow-hidden rounded-t-md bg-paper">
          {product.cover ? (
            <ProductPhoto
              image={product.cover}
              sizes={sizes}
              eager={eager}
              className={cn(
                "absolute inset-0 h-full w-full object-contain p-3",
                soldOut && "opacity-50 grayscale",
              )}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-ink-soft">
              sem foto
            </span>
          )}
        </div>
        <div className="flex grow flex-col pt-2 pb-3">
          <div className="product-card__offer mb-2 flex flex-wrap items-stretch justify-between gap-x-2 gap-y-1">
            {/* No lugar da categoria: a vantagem que decide o clique, ao lado do preço e com a
                mesma altura dele (a linha estica os dois); colado à borda esquerda como o preço à direita.
                No card estreito, os dois ficam compactos para caber na mesma linha (`.product-card` em
                globals.css); só um preço muito longo ainda desce para a linha de baixo. */}
            {product.availability === "in_stock" ? (
              <DeliveryPromiseBadge edge className="whitespace-nowrap" />
            ) : (
              <AvailabilityTag availability={product.availability} className="self-center pl-3" />
            )}
            <PriceTag
              cents={product.priceCents}
              size="sm"
              align="right"
              className="ml-auto shrink-0 flex-col items-end whitespace-nowrap sm:flex-row sm:items-baseline"
            />
          </div>
          <div className="flex grow flex-col px-3">
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold group-hover:text-brand-strong group-hover:underline">
              {product.name}
            </p>
            {installment && <Installment offer={installment} />}
            {/* Rodapé preso ao fim do card: características à esquerda, selo de prova sempre no
                canto inferior direito, qualquer que seja o tamanho do nome ou dos chips. */}
            {(chips.length > 0 || proof) && (
              <div className="mt-auto flex flex-wrap items-end gap-x-2 gap-y-1 pt-2">
                <ul
                  className="flex min-w-24 flex-1 flex-wrap gap-1 overflow-hidden"
                  aria-label="Características"
                >
                  {chips.map((chip) => (
                    <li
                      key={chip}
                      className="max-w-full truncate rounded-sm bg-shelf px-1.5 py-0.5 text-[11px] leading-tight font-medium text-ink-soft ring-1 ring-line"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
                {proof && <SoldPill text={proof.text} className="ml-auto" />}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
