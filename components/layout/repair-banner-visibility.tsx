"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/** Mantém a oferta nas páginas institucionais e no catálogo, fora do detalhe do produto. */
export function RepairBannerVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (/^\/produtos\/[^/]+\/?$/.test(pathname)) return null
  return children
}
