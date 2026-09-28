import { describe, expect, it } from "vitest"
import {
  collectCategories,
  isPublished,
  productSlug,
  slugify,
  sortForShowcase,
  toSiteProduct,
} from "@/lib/catalog-rules"

const raw = (overrides: Record<string, unknown> = {}) => ({
  id: "abc123def456",
  name: "Capa anti-impacto iPhone 15",
  images: ["https://cdn/x.png"],
  totalStock: 3,
  priceRange: { min: 7990, max: 9990 },
  site: { published: true },
  ...overrides,
})

describe("regra de publicação", () => {
  it("exige ativo e marcado para o site", () => {
    expect(isPublished(raw())).toBe(true)
    expect(isPublished(raw({ isActive: false }))).toBe(false)
    expect(isPublished(raw({ site: { published: false } }))).toBe(false)
    expect(isPublished(raw({ site: undefined }))).toBe(false)
  })
})

describe("slug", () => {
  it("tira acento, espaço e pontuação", () => {
    expect(slugify("Película 3D — iPhone 15 Pro")).toBe("pelicula-3d-iphone-15-pro")
  })

  it("usa o slug do admin quando existe", () => {
    expect(productSlug(raw({ site: { published: true, slug: "capa-iphone-15" } }))).toBe(
      "capa-iphone-15",
    )
  })

  it("sem slug, deriva do nome com sufixo do id", () => {
    expect(productSlug(raw())).toBe("capa-anti-impacto-iphone-15-abc123")
  })
})

describe("produto da vitrine", () => {
  it("marca 'a partir de' só quando o preço varia", () => {
    expect(toSiteProduct(raw()).hasVariants).toBe(true)
    expect(toSiteProduct(raw({ priceRange: { min: 3500, max: 3500 } })).hasVariants).toBe(false)
  })

  it("sem estoque continua visível, mas marcado como indisponível", () => {
    expect(toSiteProduct(raw({ totalStock: 0 })).available).toBe(false)
  })

  it("ordena destaque, depois ordem manual, depois nome", () => {
    const list = [
      toSiteProduct(raw({ id: "c", name: "Carregador", site: { published: true } })),
      toSiteProduct(raw({ id: "a", name: "Anel", site: { published: true, order: 1 } })),
      toSiteProduct(raw({ id: "d", name: "Destaque", site: { published: true, highlight: true } })),
    ]
    expect(sortForShowcase(list).map((item) => item.name)).toEqual([
      "Destaque",
      "Anel",
      "Carregador",
    ])
  })

  it("agrupa categorias por quantidade", () => {
    const list = [
      toSiteProduct(raw({ id: "1", category: "Capinhas" })),
      toSiteProduct(raw({ id: "2", category: "Capinhas" })),
      toSiteProduct(raw({ id: "3", category: "Áudio" })),
    ]
    expect(collectCategories(list)).toEqual([
      { name: "Capinhas", count: 2 },
      { name: "Áudio", count: 1 },
    ])
  })
})
