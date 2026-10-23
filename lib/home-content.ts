/**
 * Conteúdo editorial da home (`siteContent/home`, editado no admin): a abertura
 * e os depoimentos. Puro — sem Firebase — para testar contra o formato real.
 */

export interface HomeHero {
  title: string
  subtitle?: string
  image?: string
  ctaLabel?: string
  ctaHref?: string
}

export interface Testimonial {
  name: string
  text: string
  /** 1 a 5. */
  rating?: number
}

export interface HomeContent {
  hero?: HomeHero
  testimonials: Testimonial[]
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

/** `siteContent/home` → abertura e depoimentos. Campo vazio é ausência. */
export function toHomeContent(data: Record<string, unknown> | undefined): HomeContent {
  const hero = (data?.hero ?? {}) as Record<string, unknown>
  const title = str(hero.title)
  const testimonials = Array.isArray(data?.testimonials) ? data.testimonials : []

  return {
    hero: title
      ? {
          title,
          subtitle: str(hero.subtitle),
          image: str(hero.image),
          ctaLabel: str(hero.ctaLabel),
          ctaHref: str(hero.ctaHref),
        }
      : undefined,
    testimonials: testimonials.flatMap((item: Record<string, unknown>) => {
      const name = str(item?.name) ?? str(item?.author)
      const text = str(item?.text) ?? str(item?.quote)
      if (!name || !text) return []
      const rating = Number(item?.rating)
      return [{ name, text, ...(rating >= 1 && rating <= 5 ? { rating: Math.round(rating) } : {}) }]
    }),
  }
}
