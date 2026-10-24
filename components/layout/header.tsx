import Link from "next/link"
import { type ReactNode, Suspense } from "react"
import { Brand } from "@/components/layout/brand"
import { HeaderFrame } from "@/components/layout/header-frame"
import { SearchField } from "@/components/layout/search-field"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import type { HomeHero } from "@/lib/home-content"

/**
 * Benefícios; depois marca, busca e canais de atendimento. No celular a busca
 * ganha uma terceira linha, sem disputar espaço com a marca e os botões.
 */
export function Header({
  storeName,
  logoUrl,
  whatsapp,
  hero,
  benefits,
  instagram,
}: {
  storeName: string
  logoUrl?: string
  whatsapp?: string
  hero?: HomeHero
  benefits?: ReactNode
  instagram?: ReactNode
}) {
  return (
    <HeaderFrame>
      <div className="mx-auto max-w-site px-3 py-2 sm:px-4">
        {benefits}
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 md:flex-nowrap lg:gap-4">
          <Link
            href="/"
            className="flex h-11 min-w-0 flex-1 flex-col justify-center gap-0.5 md:w-44 md:flex-none md:shrink-0 lg:w-64"
          >
            <span className="flex h-6 max-w-full items-center">
              <Brand name={storeName} logoUrl={logoUrl} className="text-base sm:text-xl" />
            </span>
            <span
              className="block w-full truncate text-[10px] leading-tight text-ink-soft sm:text-xs"
              title={hero?.title ?? "Assistência e acessórios para celular"}
            >
              {hero?.title ?? "Assistência e acessórios para celular"}
            </span>
          </Link>
          {/* No celular a busca desce para uma linha só dela; do tablet em diante fica no meio. */}
          <div className="order-last w-full min-w-0 md:order-none md:w-auto md:flex-1">
            <Suspense fallback={<div className="h-11 rounded-sm bg-brand-soft" />}>
              <SearchField />
            </Suspense>
          </div>
          <div className="flex h-11 shrink-0 items-center gap-2">
            {whatsapp && (
              <WhatsAppCta
                number={whatsapp}
                label={<span className="hidden lg:inline">WhatsApp</span>}
                ariaLabel="Falar no WhatsApp"
                source="cabecalho"
                className="h-11 w-11! gap-0 px-0 lg:w-auto! lg:gap-2 lg:px-3 lg:text-xs [&_svg]:shrink-0"
              />
            )}
            {instagram}
          </div>
        </div>
      </div>
    </HeaderFrame>
  )
}
