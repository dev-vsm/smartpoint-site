import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

type Variant = "solid" | "outline" | "ghost" | "whatsapp"

const VARIANTS: Record<Variant, string> = {
  // Ação principal da marca (navegar, filtrar, ver mais).
  solid: "bg-brand text-brand-ink hover:bg-brand-strong hover:text-paper",
  outline: "border border-brand-strong bg-paper text-brand-strong hover:bg-brand-soft",
  ghost: "text-brand-strong hover:bg-brand-soft",
  // Verde é exclusivo de "falar com a loja" — ver CLAUDE.md.
  whatsapp: "bg-zap text-zap-ink hover:brightness-95",
}

export function Button({
  variant = "solid",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={cn(base(variant), className)} {...props} />
}

/** Mesma aparência do botão para links (CTA de WhatsApp, navegação). */
export function ButtonLink({
  variant = "solid",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: Variant }) {
  return <a className={cn(base(variant), className)} {...props} />
}

function base(variant: Variant) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold",
    "transition-colors disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
  )
}
