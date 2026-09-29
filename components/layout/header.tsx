"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Brand } from "@/components/layout/brand"
import { NoticeStrip } from "@/components/layout/notice-strip"
import { SearchField } from "@/components/layout/search-field"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import type { SiteNotice } from "@/lib/site-content"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/produtos", label: "Produtos" },
  { href: "/sobre", label: "A loja" },
  { href: "/contato", label: "Onde estamos" },
]

/** Item do submenu da rota (hoje, as categorias da vitrine). */
export interface SubmenuItem {
  label: string
  href: string
  /** Parâmetro que marca este item como ativo (ex.: `categoria=Capinhas`). */
  match?: { param: string; value: string | null }
}

/**
 * Três faixas: marca e avisos, busca e — quando a rota tem — o submenu dela.
 * As rotas do site vivem no menu do botão, em qualquer tamanho de tela: o topo
 * é da loja falando com o cliente (entrega, pagamento, promoção).
 */
export function Header({
  storeName,
  logoUrl,
  whatsapp,
  notices = [],
  submenu = [],
}: {
  storeName: string
  logoUrl?: string
  whatsapp: string
  notices?: SiteNotice[]
  submenu?: SubmenuItem[]
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 bg-paper">
      {/* 1 · marca, avisos e o contato */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0">
          <Brand name={storeName} logoUrl={logoUrl} />
        </Link>

        <NoticeStrip notices={notices} className="hidden flex-1 justify-center md:flex" />

        <div className="hidden shrink-0 md:block">
          <WhatsAppCta number={whatsapp} label="WhatsApp" />
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-principal"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((current) => !current)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm"
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

      {/* No celular os avisos ganham a linha inteira: no topo não cabem. */}
      <NoticeStrip notices={notices} className="mx-auto max-w-6xl px-3 pb-1 md:hidden" />

      {/* 2 · busca, logo abaixo da marca */}
      <div className="mx-auto max-w-6xl px-4 py-2">
        <Suspense fallback={null}>
          <SearchField />
        </Suspense>
      </div>

      {/* 3 · submenu da rota atual */}
      {submenu.length > 0 && (
        <Suspense fallback={null}>
          <Submenu items={submenu} />
        </Suspense>
      )}

      {open && (
        <nav id="menu-principal" aria-label="Principal" className="border-t border-line bg-paper">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                  className={cn(
                    "block py-3 text-base font-semibold",
                    pathname.startsWith(link.href) && "text-brand-strong",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <WhatsAppCta number={whatsapp} label="Chamar no WhatsApp" className="sm:w-auto" />
          </div>
        </nav>
      )}
    </header>
  )
}

/** Rola na horizontal no celular: nunca esconde categoria atrás de "mais". */
function Submenu({ items }: { items: SubmenuItem[] }) {
  const params = useSearchParams()
  const pathname = usePathname()
  const isCatalog = items.some((item) => item.match?.param === "categoria")

  return (
    <nav
      aria-label={isCatalog ? "Categorias de produtos" : "Seções desta página"}
      className="mx-auto flex max-w-6xl items-center gap-5 px-4"
    >
      {isCatalog && (
        <span className="hidden shrink-0 pr-5 text-xs font-semibold uppercase tracking-widest text-ink-soft md:block">
          Categorias
        </span>
      )}
      <ul className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2 [scrollbar-width:thin]">
        {items.map((item) => {
          const active = item.match
            ? pathname === item.href.split("?")[0] &&
              (params.get(item.match.param) || null) === item.match.value
            : false
          let href = item.href
          if (item.match?.param === "categoria" && pathname === "/produtos") {
            const search = new URLSearchParams(params.toString())
            if (item.match.value) search.set("categoria", item.match.value)
            else search.delete("categoria")
            href = search.size ? `/produtos?${search}` : "/produtos"
          }
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={href}
                scroll={isCatalog && pathname === "/produtos" ? false : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-sm font-semibold transition-colors focus-visible:-outline-offset-2",
                  active
                    ? "bg-brand text-brand-ink shadow-sm"
                    : "text-ink-soft hover:bg-brand-soft hover:text-brand-strong",
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
