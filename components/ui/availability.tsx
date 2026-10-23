import type { Availability } from "@/lib/catalog-rules"
import { cn } from "@/lib/utils"

/** Selo curto, no canto da foto do card. */
const BADGE: Record<Availability, { label: string; style: string }> = {
  in_stock: { label: "Pronta entrega", style: "bg-brand-soft text-brand-strong" },
  on_order: { label: "Sob encomenda", style: "bg-tag-soft text-tag-strong" },
  sold_out: { label: "Esgotado", style: "bg-ink/80 text-paper" },
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
    <span className={cn("rounded-sm px-1.5 py-0.5 text-[11px] font-semibold", style, className)}>
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
