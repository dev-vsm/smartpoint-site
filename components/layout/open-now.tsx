"use client"

import { useEffect, useState } from "react"
import { type HoursSlot, type OpenStatus, openStatus, openStatusText, storeNow } from "@/lib/hours"
import { cn } from "@/lib/utils"

/**
 * "Aberto agora · fecha às 20:00". Calculado no navegador: a página sai do
 * cache (ISR), então o servidor não sabe que horas são para quem está vendo.
 * Até montar, reserva a linha para nada pular de lugar.
 */
export function OpenNow({ hours, className }: { hours: HoursSlot[]; className?: string }) {
  const [status, setStatus] = useState<OpenStatus | null>(null)

  useEffect(() => {
    const update = () => setStatus(openStatus(hours, storeNow(new Date())))
    update()
    const timer = window.setInterval(update, 60_000)
    return () => window.clearInterval(timer)
  }, [hours])

  if (hours.length === 0) return null

  return (
    <p
      className={cn("flex min-h-5 items-center gap-2 text-sm text-ink-soft", className)}
      aria-live="polite"
    >
      {status && (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              status.open ? "bg-brand" : "bg-ink-soft/50",
            )}
          />
          <span className={cn(status.open && "font-semibold text-brand-strong")}>
            {openStatusText(status)}
          </span>
        </>
      )}
    </p>
  )
}
