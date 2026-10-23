import type { Availability, SiteProduct } from "@/lib/catalog-rules"
import { parseDays } from "@/lib/hours"
import type { SiteStore } from "@/lib/store"

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://capinhasudi.com.br").replace(
  /\/$/,
  "",
)

export const absolute = (path: string) => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/**
 * "Segunda a sexta" → Monday..Friday. É o que faz o horário aparecer no
 * resultado do Google, então erra para menos: dia que não reconhece, fica fora.
 */
export function openingHours(hours: SiteStore["hours"]) {
  return hours
    .map((slot) => {
      const days = parseDays(slot.days)
      if (!days.length) return null
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days.map((day) => SCHEMA_DAYS[day]),
        opens: slot.opens,
        closes: slot.closes,
      }
    })
    .filter(Boolean)
}

const SCHEMA_AVAILABILITY: Record<Availability, string> = {
  in_stock: "https://schema.org/InStock",
  on_order: "https://schema.org/BackOrder",
  sold_out: "https://schema.org/OutOfStock",
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
    ...(store.social.length ? { sameAs: store.social.map((link) => link.url) } : {}),
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
      availability: SCHEMA_AVAILABILITY[product.availability],
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
