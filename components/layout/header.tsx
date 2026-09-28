"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { Brand } from "@/components/layout/brand"
import { SearchField } from "@/components/layout/search-field"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/produtos", label: "Produtos" },
  { href: "/servicos", label: "Consertos" },
  { href: "/sobre", label: "A loja" },
  { href: "/contato", label: "Onde estamos" },
]

export function Header({
  storeName,
  logoUrl,
  whatsapp,
}: {
  storeName: string
  logoUrl?: string
  whatsapp: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0">
          <Brand name={storeName} logoUrl={logoUrl} />
        </Link>

        <nav aria-label="Principal" className="hidden gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <WhatsAppCta number={whatsapp} label="Chamar no WhatsApp" />
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-sm md:hidden"
        >
          <span className="relative block h-4 w-6">
            {[0, 1, 2].map((line) => (
              <span
                key={line}
                className={cn(
                  "absolute left-0 block h-0.5 w-full bg-ink transition-transform",
                  line === 0 && (open ? "top-1.5 rotate-45" : "top-0"),
                  line === 1 && (open ? "top-1.5 opacity-0" : "top-1.5"),
                  line === 2 && (open ? "top-1.5 -rotate-45" : "top-3"),
                )}
              />
            ))}
          </span>
        </button>
      </div>

      <div className="border-t border-line px-4 py-2 md:hidden">
        <Suspense fallback={null}>
          <SearchField />
        </Suspense>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Principal" className="border-t border-line md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-semibold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <WhatsAppCta number={whatsapp} label="Chamar no WhatsApp" />
          </div>
        </nav>
      )}
    </header>
  )
}
