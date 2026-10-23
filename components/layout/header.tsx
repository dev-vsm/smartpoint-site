import Link from "next/link"
import { Suspense } from "react"
import { Brand } from "@/components/layout/brand"
import { SearchField } from "@/components/layout/search-field"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import type { HomeHero } from "@/lib/home-content"

/** Cabeçalho fixo com marca, busca e contato. */
export function Header({
  storeName,
  logoUrl,
  whatsapp,
  hero,
  city,
}: {
  storeName: string
  logoUrl?: string
  whatsapp?: string
  hero?: HomeHero
  city?: string
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper shadow-sm shadow-ink/5">
      {/* Celular: marca numa linha, busca na de baixo. Do tablet para cima,
          marca, busca e WhatsApp dividem uma linha só. */}
      <div className="mx-auto flex max-w-site flex-wrap items-center gap-x-4 px-4 md:h-24 md:flex-nowrap">
        <div className="flex h-24 w-full min-w-0 flex-col justify-center gap-1 md:w-[44%] md:max-w-md md:shrink-0">
          <Link href="/" className="flex h-6 w-fit max-w-full items-center">
            <Brand name={storeName} logoUrl={logoUrl} />
          </Link>
          <p className="line-clamp-1 text-xs font-semibold leading-tight text-ink">
            {hero?.title ?? `Acessórios para celular${city ? ` em ${city}` : ""}`}
          </p>
          {hero?.subtitle && (
            <p className="line-clamp-1 text-[11px] leading-tight text-ink-soft">{hero.subtitle}</p>
          )}
          <Link
            href={hero?.ctaHref ?? "/produtos"}
            className="w-fit text-[11px] font-semibold leading-tight text-brand-strong hover:underline"
          >
            {hero?.ctaLabel ?? "Encontre seu acessório"} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="w-full pb-2 md:mx-auto md:max-w-3xl md:flex-1 md:pb-0">
          <Suspense fallback={null}>
            <SearchField />
          </Suspense>
        </div>

        {whatsapp && (
          <div className="hidden shrink-0 items-center md:flex">
            <WhatsAppCta
              number={whatsapp}
              label="WhatsApp"
              ariaLabel="Falar no WhatsApp"
              source="cabecalho"
            />
          </div>
        )}
      </div>
    </header>
  )
}
