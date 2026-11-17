"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Mantém a oferta nas páginas institucionais e no catálogo. Some no detalhe do produto e no
 * fluxo de compra (carrinho e página do pedido), onde só atrapalharia o fechamento.
 */
const HIDDEN = [/^\/produtos\/[^/]+\/?$/, /^\/carrinho\/?$/, /^\/pedido(\/|$)/]

export function RepairBannerVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (HIDDEN.some((route) => route.test(pathname))) return null
  return children
}
