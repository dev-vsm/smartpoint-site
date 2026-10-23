"use client"

import { track } from "@vercel/analytics"
import { useEffect } from "react"

/**
 * Conta cada clique que abre o WhatsApp — a métrica principal do site (design
 * doc §2). Um ouvinte só, na página inteira: os botões continuam sendo links
 * de servidor, sem JS próprio. A origem e o produto vêm de `data-wa-source` e
 * `data-wa-product`, que o `WhatsAppCta` escreve.
 */
export function ConversionTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
        'a[href^="https://wa.me/"]',
      )
      if (!link) return
      track("whatsapp_click", {
        origem: link.dataset.waSource ?? "outro",
        produto: link.dataset.waProduct ?? null,
        pagina: window.location.pathname,
      })
    }
    document.addEventListener("click", onClick, { capture: true })
    return () => document.removeEventListener("click", onClick, { capture: true })
  }, [])

  return null
}
