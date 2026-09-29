"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

/** Item do submenu da rota (hoje, as categorias da vitrine). */
export interface SubmenuItem {
  label: string
  href: string
  /** Parâmetro que marca este item como ativo (ex.: `categoria=Capinhas`). */
  match?: { param: string; value: string | null }
}

/** Rola na horizontal no celular: nunca esconde categoria atrás de "mais". */
export function SubmenuNav({ items }: { items: SubmenuItem[] }) {
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
