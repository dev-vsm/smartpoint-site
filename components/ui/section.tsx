import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Largura útil do site. Uma medida só, para tudo alinhar. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4", className)}>{children}</div>
}

/**
 * Título de seção com a ação à direita (ex.: "ver todos"). Sem sobretítulo em
 * caixa alta: o título já diz o que é.
 */
export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-2xl">{title}</h2>
        {description && <p className="mt-1 max-w-prose text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  )
}
