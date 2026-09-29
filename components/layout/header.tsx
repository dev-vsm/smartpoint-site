import Link from "next/link"
import { Suspense } from "react"
import { Brand } from "@/components/layout/brand"
import { NoticeStrip } from "@/components/layout/notice-strip"
import { SearchField } from "@/components/layout/search-field"
import { type SubmenuItem, SubmenuNav } from "@/components/layout/submenu-nav"
import type { SiteNotice } from "@/lib/site-content"

export type { SubmenuItem }

/**
 * A marca mora na margem da esquerda — o vazio que sobra dos lados da faixa
 * centralizada —, e a faixa fica só com o que muda: avisos, busca e o submenu
 * da rota. O topo não navega: quem navega é a busca, as categorias e o rodapé.
 *
 * A margem só existe em tela larga: a faixa tem 1152px e a marca pede mais 160
 * de cada lado para o conteúdo seguir centralizado. Abaixo de 1400px, então, a
 * marca volta para cima das linhas.
 */
export function Header({
  storeName,
  logoUrl,
  notices = [],
  submenu = [],
}: {
  storeName: string
  logoUrl?: string
  notices?: SiteNotice[]
  submenu?: SubmenuItem[]
}) {
  return (
    <header className="sticky top-0 z-30 bg-paper">
      <div className="relative mx-auto max-w-6xl px-4">
        <Link
          href="/"
          className="flex h-14 w-40 items-center min-[1400px]:absolute min-[1400px]:top-0 min-[1400px]:right-full min-[1400px]:h-full min-[1400px]:w-[calc((100vw-72rem)/2)] min-[1400px]:justify-center"
        >
          <Brand
            name={storeName}
            logoUrl={logoUrl}
            className="min-[1400px]:w-full! min-[1400px]:object-center! min-[1400px]:text-center"
          />
        </Link>

        <NoticeStrip notices={notices} className="hidden justify-end py-3 md:flex" />

        {/* No celular os avisos ganham a linha inteira: no topo não cabem. */}
        <NoticeStrip notices={notices} className="pb-1 md:hidden" />

        <div className="py-2">
          <Suspense fallback={null}>
            <SearchField />
          </Suspense>
        </div>

        {submenu.length > 0 && (
          <Suspense fallback={null}>
            <SubmenuNav items={submenu} />
          </Suspense>
        )}
      </div>
    </header>
  )
}
