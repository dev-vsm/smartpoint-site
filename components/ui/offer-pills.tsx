import type { InstallmentOffer } from "@/lib/trust"
import { cn, formatPrice } from "@/lib/utils"

/**
 * Peças de oferta do card e da página do produto: a parcela ("3x de R$ 19,97 sem juros") e a
 * prova social ("+50 vendidos"). Sem estado: servem ao servidor e ao navegador.
 */

/** Parcela com ícone de cartão: o valor em destaque e "sem juros" em pílula. */
export function Installment({
  offer,
  size = "sm",
}: {
  offer: InstallmentOffer
  /** `lg`: página do produto, embaixo do preço grande. */
  size?: "sm" | "lg"
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-ink",
        size === "lg" ? "text-base" : "mt-1.5 text-xs",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
        className={cn("shrink-0 text-brand-strong", size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5")}
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h4" />
      </svg>
      {offer.interestFree ? (
        <>
          <span>
            <strong className="font-extrabold">{offer.count}x</strong> de{" "}
            <strong className="font-extrabold">{formatPrice(offer.valueCents)}</strong>
          </span>
          <span
            className={cn(
              "rounded-sm bg-brand-soft px-1 py-px leading-tight font-bold tracking-wide text-brand-strong uppercase",
              size === "lg" ? "text-xs" : "text-[10px]",
            )}
          >
            sem juros
          </span>
        </>
      ) : (
        <span>
          em até <strong className="font-extrabold">{offer.count}x</strong> no cartão
        </span>
      )}
    </p>
  )
}

/** "+50 vendidos": prova social na cor da marca, com seta de alta, no rodapé do card. */
export function SoldPill({ text, className }: { text: string; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-sm bg-brand-soft px-1.5 py-0.5 text-[11px] leading-tight font-bold whitespace-nowrap text-brand-strong ring-1 ring-brand/30",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3 w-3 shrink-0"
      >
        <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
      </svg>
      {text}
    </p>
  )
}
