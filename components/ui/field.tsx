import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Rótulo + dica de um campo. O `htmlFor` é obrigatório: o rótulo precisa
 * apontar para o controle, senão leitor de tela e clique no texto não funcionam.
 */
export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

const control =
  "w-full min-h-11 rounded-sm border border-line bg-paper px-3 text-sm outline-none transition-colors focus:border-ink"

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 resize-y py-2", className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, className)} {...props} />
}
