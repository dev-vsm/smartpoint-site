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

/**
 * Categorias fluem na página em qualquer tela, sem criar uma área de rolagem própria.
 */
export function SubmenuNav({ items }: { items: SubmenuItem[] }) {
  const params = useSearchParams()
  const pathname = usePathname()
  return <SubmenuLinks items={items} pathname={pathname} params={params} />
}

/**
 * O mesmo menu sem ler a URL, para o HTML estático: `useSearchParams` só
 * resolve no navegador, e sem isto as categorias surgiriam depois do JS,
 * empurrando a página para baixo. Fica sem item ativo até hidratar.
 */
export function SubmenuFallback({ items }: { items: SubmenuItem[] }) {
  return <SubmenuLinks items={items} pathname="" params={new URLSearchParams()} />
}

function SubmenuLinks({
  items,
  pathname,
  params,
}: {
  items: SubmenuItem[]
  pathname: string
  params: Pick<URLSearchParams, "get" | "toString">
}) {
  const isCatalog = items.some((item) => item.match?.param === "categoria")

  return (
    <nav aria-label={isCatalog ? "Categorias de produtos" : "Seções desta página"}>
      <ul className="flex flex-wrap gap-1 py-2 lg:flex-col lg:flex-nowrap lg:py-0">
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
            // Outra categoria tem outra contagem: volta para a primeira página.
            search.delete("pagina")
            href = search.size ? `/produtos?${search}` : "/produtos"
          }
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center whitespace-nowrap rounded-md px-3 lg:min-h-9 lg:whitespace-normal lg:py-1.5 text-sm font-semibold transition-colors focus-visible:-outline-offset-2",
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
