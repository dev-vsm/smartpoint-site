"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { cartActions } from "@/lib/cart-store"

/** Pagamento aguardando: consulta de novo a cada 8 s, por até 3 minutos (Pix leva alguns segundos). */
const INTERVAL_MS = 8000
const MAX_CHECKS = 22

/**
 * Página do pedido: pago, esvazia o carrinho; aguardando, atualiza sozinha até o Mercado
 * Pago confirmar (o servidor confere a cada atualização).
 */
export function OrderWatcher({ status }: { status: "awaiting_payment" | "paid" | "cancelled" }) {
  const router = useRouter()

  useEffect(() => {
    if (status === "paid") cartActions.clear()
  }, [status])

  useEffect(() => {
    if (status !== "awaiting_payment") return
    let checks = 0
    const timer = window.setInterval(() => {
      checks += 1
      if (checks > MAX_CHECKS) window.clearInterval(timer)
      else router.refresh()
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [status, router])

  return null
}
