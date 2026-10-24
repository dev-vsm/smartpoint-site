import { describe, expect, it } from "vitest"
import { bannerSlides, REPAIR_SLIDES, storePlace, storeSlide } from "@/lib/repair-slides"
import { FALLBACK_STORE, type SiteStore } from "@/lib/store-rules"

const store: SiteStore = {
  ...FALLBACK_STORE,
  name: "smartpoint",
  city: "Uberlândia",
  district: "Jardim Brasília",
  about: "vendemos acessórios para celular.\nVenha nos conhecer",
  brand: { logoUrl: "https://cdn/logo.svg" },
  social: [{ network: "instagram", label: "Instagram", url: "https://instagram.com/loja" }],
}

describe("slide da loja no carrossel", () => {
  it("abre o carrossel com a logo e o texto Sobre do cadastro", () => {
    const slides = bannerSlides(store)
    expect(slides[0]).toMatchObject({
      id: "loja",
      title: "Conheça a",
      brandName: "smartpoint",
      label: "Assistência e acessórios para celular em Uberlândia, com qualidade e garantia",
      description: "Vendemos acessórios para celular. Venha nos conhecer",
      benefit: "Loja física no bairro Jardim Brasília, Uberlândia",
      logo: { url: "https://cdn/logo.svg", alt: "smartpoint" },
      social: [{ network: "instagram", url: "https://instagram.com/loja" }],
    })
    expect(slides.slice(1)).toEqual(REPAIR_SLIDES)
  })

  it("sem logo cadastrada, não cria o slide", () => {
    expect(storeSlide(FALLBACK_STORE)).toBeUndefined()
    expect(bannerSlides(FALLBACK_STORE)).toEqual(REPAIR_SLIDES)
  })
})

describe("frase do endereço", () => {
  it("usa 'no bairro', a cidade e o complemento quando houver", () => {
    expect(storePlace({ ...store, district: "Brasil", complement: "Sala 3" })).toBe(
      "Loja física no bairro Brasil, Uberlândia · Sala 3",
    )
    expect(storePlace({ ...store, district: undefined })).toBe("Loja física em Uberlândia")
    expect(storePlace(FALLBACK_STORE)).toBeUndefined()
  })
})
