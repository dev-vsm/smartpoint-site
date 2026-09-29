import Link from "next/link"
import { Suspense } from "react"
import { Brand } from "@/components/layout/brand"
import { NoticeStrip } from "@/components/layout/notice-strip"
import { SearchField } from "@/components/layout/search-field"
import { type SubmenuItem, SubmenuNav } from "@/components/layout/submenu-nav"
import type { SiteNotice } from "@/lib/site-content"

export type { SubmenuItem }

/**
 * Três faixas: marca e avisos, busca e — quando a rota tem — o submenu dela.
 * O topo não navega: quem navega é a busca, o submenu de categorias e o
 * rodapé. Sem menu, o cabeçalho inteiro é HTML, sem JS de estado.
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
      {/* 1 · marca no canto e os avisos da loja ocupando o resto */}
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0">
          <Brand name={storeName} logoUrl={logoUrl} />
        </Link>
        <NoticeStrip notices={notices} className="hidden flex-1 justify-end md:flex" />
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
          <SubmenuNav items={submenu} />
        </Suspense>
      )}
    </header>
  )
}
