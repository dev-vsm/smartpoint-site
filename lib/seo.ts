import type { SiteProduct } from "@/lib/catalog-rules"
import type { SiteStore } from "@/lib/store"

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://capinhasudi.com.br").replace(
  /\/$/,
  "",
)

export const absolute = (path: string) => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`

/** Dias da semana em inglês, como o schema.org espera. */
const DAY_MAP: Record<string, string> = {
  segunda: "Monday",
  terça: "Tuesday",
  terca: "Tuesday",
  quarta: "Wednesday",
  quinta: "Thursday",
  sexta: "Friday",
  sábado: "Saturday",
  sabado: "Saturday",
  domingo: "Sunday",
}

/**
 * "Segunda a sexta" → Monday..Friday. É o que faz o horário aparecer no
 * resultado do Google, então erra para menos: dia que não reconhece, fica fora.
 */
export function openingHours(hours: SiteStore["hours"]) {
  return hours
    .map((slot) => {
      const days = Object.entries(DAY_MAP)
        .filter(([label]) => slot.days.toLowerCase().includes(label))
        .map(([, day]) => day)
      if (!days.length) return null
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...new Set(days)],
        opens: slot.opens,
        closes: slot.closes,
      }
    })
    .filter(Boolean)
}

export function localBusinessJsonLd(store: SiteStore) {
  const [street] = store.addressLine.split(" — ")
  const [city, state] = store.cityLine.split(", ")
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    name: store.name,
    url: siteUrl,
    ...(store.brand.logoUrl ? { logo: store.brand.logoUrl } : {}),
    ...(store.brand.ogImageUrl ? { image: store.brand.ogImageUrl } : {}),
    ...(store.phone ? { telephone: store.phone } : {}),
    ...(store.cnpj ? { taxID: store.cnpj } : {}),
    ...(store.instagram || store.facebook
      ? { sameAs: [store.instagram, store.facebook].filter(Boolean) }
      : {}),
    ...(street || city
      ? {
          address: {
            "@type": "PostalAddress",
            ...(street ? { streetAddress: street } : {}),
            ...(city ? { addressLocality: city } : {}),
            ...(state ? { addressRegion: state } : {}),
            ...(store.postalCode ? { postalCode: store.postalCode } : {}),
            addressCountry: "BR",
          },
        }
      : {}),
    ...(store.hours.length ? { openingHoursSpecification: openingHours(store.hours) } : {}),
  }
}

export function productJsonLd(product: SiteProduct, store: SiteStore) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.images.length ? { image: product.images } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.category ? { category: product.category } : {}),
    offers: {
      "@type": "Offer",
      price: (product.priceFromCents / 100).toFixed(2),
      priceCurrency: "BRL",
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absolute(`/produtos/${product.slug}`),
      seller: { "@type": "Organization", name: store.name },
    },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  }
}
