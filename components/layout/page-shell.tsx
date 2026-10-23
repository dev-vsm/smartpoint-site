import { type ReactNode, Suspense } from "react"
import { SubmenuFallback, type SubmenuItem, SubmenuNav } from "@/components/layout/submenu-nav"
import { cn } from "@/lib/utils"

/**
 * Miolo das páginas: as categorias numa coluna à esquerda e o conteúdo ao lado.
 * A coluna acompanha a rolagem logo abaixo do cabeçalho fixo e, se a lista
 * passar da altura da tela, rola sozinha. No celular não há
 * espaço para a lateral: o menu vira uma linha rolável acima do conteúdo.
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
        <aside className="border-b border-line lg:sticky lg:top-(--header-height) lg:max-h-[calc(100dvh-var(--header-height))] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:py-8 lg:[scrollbar-width:thin]">
          <Suspense fallback={<SubmenuFallback items={submenu} />}>
            <SubmenuNav items={submenu} />
          </Suspense>
        </aside>
      )}
      <main className={cn("min-w-0", className)}>{children}</main>
    </div>
  )
}
