import Link from "next/link"
import { Suspense } from "react"
import { Brand } from "@/components/layout/brand"
import { NoticeStrip } from "@/components/layout/notice-strip"
import { SearchField } from "@/components/layout/search-field"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import type { SiteNotice } from "@/lib/site-content"

/**
 * A marca mora na margem da esquerda — o vazio que sobra dos lados da faixa
 * centralizada —, e a faixa fica com avisos e busca, centralizados. As
 * categorias moram na coluna lateral (`PageShell`), não aqui.
 *
 * A margem só existe em tela larga: a faixa tem 1536px (`--container-site`) e a
 * marca pede mais 160 de cada lado para o conteúdo seguir centralizado. Abaixo
 * de 1856px, então, a marca volta para cima das linhas.
 *
 * O WhatsApp espelha a marca no canto direito, só do tablet para cima: no
 * celular ele é o botão flutuante (`WhatsAppFloating`), que fica sempre à mão.
 */
export function Header({
  storeName,
  logoUrl,
  notices = [],
  whatsapp,
}: {
  storeName: string
  logoUrl?: string
  notices?: SiteNotice[]
  whatsapp?: string
}) {
  return (
    <header className="sticky top-0 z-30 bg-paper">
      <div className="relative mx-auto max-w-site px-4">
        <Link
          href="/"
          className="flex h-14 w-40 items-center min-[1856px]:absolute min-[1856px]:top-0 min-[1856px]:right-full min-[1856px]:h-full min-[1856px]:w-[calc((100vw-var(--container-site))/2)] min-[1856px]:justify-center"
        >
          <Brand
            name={storeName}
            logoUrl={logoUrl}
            className="min-[1856px]:w-full! min-[1856px]:object-center! min-[1856px]:text-center"
          />
        </Link>

        {/* `100vw` inclui a barra de rolagem: o `- 1rem` evita rolagem lateral. */}
        {whatsapp && (
          <div className="absolute top-0 right-4 hidden h-14 items-center md:flex min-[1856px]:right-auto min-[1856px]:left-full min-[1856px]:h-full min-[1856px]:w-[calc((100vw-var(--container-site))/2-1rem)] min-[1856px]:justify-center">
            <WhatsAppCta
              number={whatsapp}
              label="WhatsApp"
              ariaLabel="Falar no WhatsApp"
              source="cabecalho"
            />
          </div>
        )}

        <NoticeStrip notices={notices} className="hidden justify-center-safe py-3 md:flex" />

        {/* No celular os avisos ganham a linha inteira: no topo não cabem. */}
        <NoticeStrip notices={notices} className="justify-center-safe pb-1 md:hidden" />

        <div className="mx-auto max-w-xl py-2">
          <Suspense fallback={null}>
            <SearchField />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
