import type { Availability } from "@/lib/catalog-rules"
import { cn } from "@/lib/utils"

/**
 * Selo curto, no canto da foto do card. Cor cheia e contorno claro para não
 * sumir sobre foto de fundo branco; nada de verde, que é do WhatsApp.
 */
const BADGE: Record<Availability, { label: string; style: string }> = {
  in_stock: { label: "Pronta entrega", style: "bg-brand-strong text-paper" },
  on_order: { label: "Sob encomenda", style: "bg-tag-strong text-paper" },
  sold_out: { label: "Esgotado", style: "bg-ink/85 text-paper" },
}

/** Frase da página do produto, ao lado do selo, logo abaixo do preço. */
const LINE: Record<Availability, string> = {
  in_stock: "Retire hoje na loja ou receba em casa.",
  on_order: "Chame no WhatsApp para saber o prazo.",
  sold_out: "Chame no WhatsApp que a gente avisa quando chegar.",
}

/** Rótulo do botão de WhatsApp: o pedido muda com a disponibilidade. */
export const CTA_LABEL: Record<Availability, { short: string; long: string }> = {
  in_stock: { short: "Quero esse", long: "Quero esse — falar no WhatsApp" },
  on_order: { short: "Encomendar", long: "Encomendar pelo WhatsApp" },
  sold_out: { short: "Avise-me", long: "Avise-me quando chegar" },
}

export function AvailabilityBadge({
  availability,
  className,
}: {
  availability: Availability
  className?: string
}) {
  const { label, style } = BADGE[availability]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs leading-none font-bold shadow-md ring-1 ring-paper/70",
        style,
        className,
      )}
    >
      {availability === "in_stock" && (
        // Ponto "ao vivo": diz que tem no estoque agora. Parado para quem pede menos movimento.
        <span aria-hidden="true" className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-paper/70 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-paper" />
        </span>
      )}
      {label}
    </span>
  )
}

export function AvailabilityLine({
  availability,
  className,
}: {
  availability: Availability
  className?: string
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-sm",
        availability === "in_stock" ? "text-brand-strong" : "text-ink-soft",
        className,
      )}
    >
      <AvailabilityBadge availability={availability} className="mt-px shrink-0" />
      <span>{LINE[availability]}</span>
    </p>
  )
}
