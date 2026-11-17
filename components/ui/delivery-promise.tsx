"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import {
  type DeliveryPromise,
  deliveryOptionText,
  deliveryPromise,
  type HoursSlot,
  pickupOptionText,
  promiseBadgeText,
  promiseDetailText,
  storeNow,
} from "@/lib/hours"
import { cn } from "@/lib/utils"

/**
 * Prazo de entrega/retirada dos produtos de pronta entrega ("Receba hoje"…), calculado no
 * navegador a cada minuto: as páginas saem do cache (ISR), então o servidor não sabe que
 * horas são para quem está vendo. O horário da loja e se ela entrega vêm do layout.
 */
const StoreClock = createContext<{ hours: HoursSlot[]; delivers: boolean }>({
  hours: [],
  delivers: false,
})

export function StoreClockProvider({
  hours,
  delivers,
  children,
}: {
  hours: HoursSlot[]
  /** A loja entrega (sem isso, só retirada: "Retire hoje"). */
  delivers: boolean
  children: ReactNode
}) {
  return <StoreClock.Provider value={{ hours, delivers }}>{children}</StoreClock.Provider>
}

export function useDeliveryPromise(): { promise: DeliveryPromise | null; delivers: boolean } {
  const { hours, delivers } = useContext(StoreClock)
  const [promise, setPromise] = useState<DeliveryPromise | null>(null)
  useEffect(() => {
    const update = () => setPromise(deliveryPromise(hours, storeNow(new Date()), { delivers }))
    update()
    const timer = window.setInterval(update, 60_000)
    return () => window.clearInterval(timer)
  }, [hours, delivers])
  return { promise, delivers }
}

function BoltIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="promise-tag__bolt h-4 w-4 shrink-0"
    >
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  )
}

/**
 * Selo do card de pronta entrega (`.promise-tag` em `globals.css`). "Receba hoje" é o selo
 * forte (ciano vivo, raio amarelo); "Retire hoje até 20h" e "Receba amanhã", a versão
 * clara. Antes de calcular (e sem horário cadastrado) mostra "Pronta entrega", que não promete
 * dia — nunca aparece uma promessa errada, nem por um instante.
 */
export function DeliveryPromiseBadge({
  edge = false,
  className,
}: {
  /** Colado à borda esquerda do card (como o preço à direita): sem canto arredondado. */
  edge?: boolean
  className?: string
}) {
  const { promise, delivers } = useDeliveryPromise()
  const strong = !promise || promise.kind === "today"
  return (
    <span
      className={cn(
        "promise-tag",
        edge && "promise-tag--edge",
        !strong && "promise-tag--soft",
        className,
      )}
    >
      <BoltIcon />
      <span className="relative">
        {promise ? promiseBadgeText(promise, delivers) : "Pronta entrega"}
      </span>
    </span>
  )
}

/** Frase da página do produto, com o prazo de cada forma de receber. */
export function DeliveryPromiseText({ fallback }: { fallback: string }) {
  const { promise, delivers } = useDeliveryPromise()
  return <span>{promise ? promiseDetailText(promise, delivers) : fallback}</span>
}

/** Prazo em texto curto ("Receba hoje"), para a barra fixa do celular embaixo do preço. */
export function DeliveryPromiseShort({ className }: { className?: string }) {
  const { promise, delivers } = useDeliveryPromise()
  if (!promise) return null
  return (
    <span className={cn("block text-[11px] leading-tight font-bold text-brand-strong", className)}>
      {promiseBadgeText(promise, delivers)}
    </span>
  )
}

/** Prazo de cada opção do carrinho ("Retire hoje até 20h", "Receba hoje se pagar até 19h"). */
export function FulfillmentPromise({ kind }: { kind: "pickup" | "delivery" }) {
  const { promise } = useDeliveryPromise()
  if (!promise) return null
  return (
    <span className="mt-0.5 block text-xs font-bold text-brand-strong">
      {kind === "pickup" ? pickupOptionText(promise) : deliveryOptionText(promise)}
    </span>
  )
}
