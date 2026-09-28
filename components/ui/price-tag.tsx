import { cn, formatPrice } from "@/lib/utils"

/**
 * Preço como etiqueta, não como texto: é o elemento gráfico que organiza a
 * vitrine. `from` marca produto com variações ("a partir de").
 */
export function PriceTag({
  cents,
  from = false,
  size = "md",
  align = "left",
  className,
}: {
  cents: number
  from?: boolean
  size?: "sm" | "md" | "lg"
  /** De qual borda a etiqueta está presa — o chanfro aponta para o conteúdo. */
  align?: "left" | "right"
  className?: string
}) {
  const scale = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size]
  return (
    <span className={cn("price-tag", align === "right" && "price-tag--right", scale, className)}>
      {from && <span className="text-[0.7em] font-medium opacity-90">a partir de</span>}
      {formatPrice(cents)}
    </span>
  )
}
