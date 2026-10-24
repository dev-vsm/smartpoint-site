import { type ReactNode, Suspense } from "react"
import { SubmenuFallback, type SubmenuItem, SubmenuNav } from "@/components/layout/submenu-nav"
import { cn } from "@/lib/utils"

/**
 * Miolo das páginas: as categorias numa coluna à esquerda e o conteúdo ao lado.
 * O menu flui com a página em vez de criar sua própria área de rolagem. No
 * celular ele some: a lista de categorias empurraria os produtos para baixo.
 */
export function PageShell({
  submenu = [],
  className,
  children,
}: {
  submenu?: SubmenuItem[]
  className?: string
  children: ReactNode
}) {
  const hasNav = submenu.length > 0

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-site px-4",
        hasNav && "lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8",
      )}
    >
      {hasNav && (
        <aside className="hidden border-b border-line md:block lg:border-b-0 lg:py-8">
          <Suspense fallback={<SubmenuFallback items={submenu} />}>
            <SubmenuNav items={submenu} />
          </Suspense>
        </aside>
      )}
      <main className={cn("min-w-0", className)}>{children}</main>
    </div>
  )
}
