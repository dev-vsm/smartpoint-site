import Image from "next/image"
import { OpenNow } from "@/components/layout/open-now"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { ButtonLink } from "@/components/ui/button"
import type { HomeHero } from "@/lib/home-content"
import type { SiteStore } from "@/lib/store"

/**
 * Abertura da home: o que a loja vende, onde fica e como comprar, numa frase.
 * Texto e imagem vêm de `siteContent/home.hero`; sem ele, a frase sai dos
 * dados da loja (bairro e cidade) — nada inventado.
 */
export function Hero({ hero, store }: { hero?: HomeHero; store: SiteStore }) {
  const title = hero?.title ?? `Acessórios para celular${store.city ? ` em ${store.city}` : ""}`
  const subtitle =
    hero?.subtitle ??
    (store.city
      ? `Retire hoje na loja${store.district ? ` no ${store.district}` : ""} ou receba em toda ${store.city}.`
      : undefined)
  const custom =
    hero?.ctaLabel && hero.ctaHref ? { label: hero.ctaLabel, href: hero.ctaHref } : null

  return (
    <section
      aria-labelledby="abertura"
      className="mb-8 grid items-center gap-6 rounded-md bg-paper p-6 ring-1 ring-line sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]"
    >
      <div>
        <h1 id="abertura" className="text-3xl first-letter:uppercase sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-prose text-ink-soft first-letter:uppercase">{subtitle}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <WhatsAppCta number={store.whatsapp} label="Falar no WhatsApp" source="home_abertura" />
          <ButtonLink variant="outline" href={custom?.href ?? "/produtos"}>
            {custom?.label ?? "Ver todos os produtos"}
          </ButtonLink>
        </div>
        <OpenNow hours={store.hours} className="mt-4" />
      </div>

      {hero?.image && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-shelf">
          <Image
            src={hero.image}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 22rem, 100vw"
            className="object-cover"
          />
        </div>
      )}
    </section>
  )
}
