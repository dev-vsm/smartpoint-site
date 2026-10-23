import { describe, expect, it } from "vitest"
import { breadcrumbJsonLd, localBusinessJsonLd, openingHours, productJsonLd } from "@/lib/seo"
import type { SiteStore } from "@/lib/store"

const store: SiteStore = {
  name: "SmartPoint",
  whatsapp: "5534998349528",
  addressLine: "Av. João Pinheiro, 337 — Centro",
  cityLine: "Uberlândia, MG",
  postalCode: "38400-000",
  social: [],
  hours: [
    { days: "Segunda a sexta", opens: "09:00", closes: "18:00" },
    { days: "Sábado", opens: "09:00", closes: "13:00" },
  ],
  payment: { methods: [], maxInstallments: 1, interestFreeInstallments: 1, minInstallmentCents: 0 },
  photos: [],
  brand: {},
}

describe("dados estruturados", () => {
  it("traduz o horário para os dias do schema.org", () => {
    expect(openingHours(store.hours)).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "13:00",
      },
    ])
  })

  it("descarta horário com dia que não reconhece", () => {
    expect(openingHours([{ days: "Feriados", opens: "10:00", closes: "14:00" }])).toEqual([])
  })

  it("monta o endereço da loja sem campos vazios", () => {
    const data = localBusinessJsonLd(store)
    expect(data.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Av. João Pinheiro, 337",
      addressLocality: "Uberlândia",
      addressRegion: "MG",
      postalCode: "38400-000",
      addressCountry: "BR",
    })
  })

  it("oferta do produto usa preço em reais e disponibilidade", () => {
    const product = {
      id: "1",
      slug: "capa",
      name: "Capa",
      images: [],
      priceFromCents: 7990,
      priceToCents: 7990,
      hasVariants: false,
      availability: "sold_out" as const,
      highlight: false,
      order: 0,
    }
    const data = productJsonLd(product, store)
    expect(data.offers.price).toBe("79.90")
    expect(data.offers.availability).toBe("https://schema.org/OutOfStock")
    expect(productJsonLd({ ...product, availability: "on_order" }, store).offers.availability).toBe(
      "https://schema.org/BackOrder",
    )
  })

  it("breadcrumb numera os níveis", () => {
    const data = breadcrumbJsonLd([
      { name: "Produtos", path: "/produtos" },
      { name: "Capa", path: "/produtos/capa" },
    ])
    expect(data.itemListElement.map((item) => item.position)).toEqual([1, 2])
  })

  it("todas as redes cadastradas entram em sameAs", () => {
    const withSocial: SiteStore = {
      ...store,
      social: [
        { network: "instagram", label: "Instagram", url: "https://instagram.com/loja" },
        { network: "tiktok", label: "TikTok", url: "https://tiktok.com/@loja" },
      ],
    }
    expect(localBusinessJsonLd(withSocial).sameAs).toEqual([
      "https://instagram.com/loja",
      "https://tiktok.com/@loja",
    ])
    expect(localBusinessJsonLd(store)).not.toHaveProperty("sameAs")
  })
})
