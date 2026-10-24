import { describe, expect, it } from "vitest"
import {
  availabilityOf,
  catalogHref,
  collectCategories,
  filterProducts,
  hasPrice,
  isPublished,
  pickBestSellers,
  pickHighlights,
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

  it("ignora preço zero e usa o maior preço válido", () => {
    const product = toSiteProduct(raw({ priceRange: { min: 0, max: 3490 } }))
    expect(product.priceFromCents).toBe(3490)
    expect(product.hasVariants).toBe(false)
    expect(hasPrice(product)).toBe(true)
  })

  it("produto sem preço nenhum fica fora da vitrine", () => {
    expect(hasPrice(toSiteProduct(raw({ priceRange: { min: 0, max: 0 } })))).toBe(false)
  })

  it("sem estoque continua visível, mas marcado como esgotado", () => {
    expect(toSiteProduct(raw()).availability).toBe("in_stock")
    expect(toSiteProduct(raw({ totalStock: 0 })).availability).toBe("sold_out")
  })

  it("action figure sem estoque vira encomenda; com estoque, pronta entrega", () => {
    const figure = (totalStock: number) =>
      toSiteProduct(
        raw({
          totalStock,
          categorization: {
            categoryName: "Presentes e Colecionáveis",
            subcategoryId: "presentes-e-colecionaveis--bonecos",
            subcategoryName: "Bonecos e action figures",
          },
        }),
      )
    expect(figure(0).availability).toBe("on_order")
    expect(figure(2).availability).toBe("in_stock")
    expect(availabilityOf(0, "cabos-e-adaptadores--cabos-para-celular")).toBe("sold_out")
  })

  it("esgotado vai para o fim, nem destaque passa na frente", () => {
    const list = [
      toSiteProduct(
        raw({
          id: "x",
          name: "Antes esgotado",
          totalStock: 0,
          site: { published: true, highlight: true, order: 0 },
        }),
      ),
      toSiteProduct(raw({ id: "b", name: "Bateria" })),
      toSiteProduct(
        raw({
          id: "f",
          name: "Figura",
          totalStock: 0,
          categorization: { subcategoryId: "presentes-e-colecionaveis--bonecos" },
        }),
      ),
    ]
    expect(sortForShowcase(list).map((item) => item.name)).toEqual([
      "Bateria",
      "Figura",
      "Antes esgotado",
    ])
    expect(pickHighlights(sortForShowcase(list))).toEqual([])
  })

  it("busca também olha a subcategoria", () => {
    const product = toSiteProduct(
      raw({ name: "Goku", categorization: { subcategoryName: "Bonecos e action figures" } }),
    )
    expect(filterProducts([product], { query: "action figure" })).toHaveLength(1)
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

  it("destaques: só os marcados, até o limite, sem completar com o resto", () => {
    const list = sortForShowcase([
      toSiteProduct(raw({ id: "a", name: "Anel" })),
      toSiteProduct(raw({ id: "b", name: "Bateria", site: { published: true, highlight: true } })),
      toSiteProduct(raw({ id: "c", name: "Capa", site: { published: true, highlight: true } })),
    ])
    expect(pickHighlights(list).map((item) => item.name)).toEqual(["Bateria", "Capa"])
    expect(pickHighlights(list, 1).map((item) => item.name)).toEqual(["Bateria"])
    expect(pickHighlights([toSiteProduct(raw())])).toEqual([])
  })

  it("ordena os mais vendidos pelo contador do admin, sem esgotado nem item sem venda", () => {
    const list = [
      toSiteProduct(raw({ id: "a", name: "Cabo", totalSold: 5 })),
      toSiteProduct(raw({ id: "b", name: "Fone", totalSold: 30 })),
      toSiteProduct(raw({ id: "c", name: "Capa", totalSold: 5, site: { highlight: true } })),
      toSiteProduct(raw({ id: "d", name: "Película", totalSold: 99, totalStock: 0 })),
      toSiteProduct(raw({ id: "e", name: "Suporte" })),
      toSiteProduct(raw({ id: "f", name: "Bateria", totalSold: -2 })),
    ]
    expect(pickBestSellers(list).map((item) => item.name)).toEqual(["Fone", "Capa", "Cabo"])
    expect(pickBestSellers(list, 1).map((item) => item.name)).toEqual(["Fone"])
    expect(pickBestSellers([toSiteProduct(raw())])).toEqual([])
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

describe("categoria", () => {
  it("vem da classificação atual e cai no campo antigo sem ela", () => {
    const current = raw({
      id: "1",
      category: "cabos",
      categorization: {
        categoryName: "Cabos e Adaptadores",
        subcategoryName: "Cabos para celular",
      },
    })
    expect(toSiteProduct(current).category).toBe("Cabos e Adaptadores")
    expect(toSiteProduct(raw({ id: "2", category: "cabos" })).category).toBe("cabos")
    expect(toSiteProduct(raw({ id: "3", categorization: {} })).category).toBeUndefined()
  })
})

describe("filterProducts", () => {
  const products = [
    toSiteProduct(raw({ id: "p1", name: "Película de vidro iPhone 15", category: "películas" })),
    toSiteProduct(raw({ id: "p2", name: "Capinha silicone iPhone 15", category: "capinhas" })),
    toSiteProduct(raw({ id: "p3", name: "Fone bluetooth", category: "fones", brand: "JBL" })),
  ]
  const ids = (list: ReturnType<typeof filterProducts>) => list.map((product) => product.id)

  it("sem filtro devolve tudo", () => {
    expect(filterProducts(products, {})).toBe(products)
  })

  it("filtra pela categoria exata", () => {
    expect(ids(filterProducts(products, { category: "capinhas" }))).toEqual(["p2"])
  })

  it("busca ignora acento, caixa e ordem dos termos", () => {
    expect(ids(filterProducts(products, { query: "IPHONE pelicula" }))).toEqual(["p1"])
    expect(ids(filterProducts(products, { query: "iphone 15" }))).toEqual(["p1", "p2"])
  })

  it("busca também olha a marca", () => {
    expect(ids(filterProducts(products, { query: "jbl" }))).toEqual(["p3"])
  })

  it("busca e categoria juntas", () => {
    expect(ids(filterProducts(products, { query: "iphone", category: "películas" }))).toEqual([
      "p1",
    ])
  })
})

describe("catalogHref", () => {
  it("sem filtro nem página é a vitrine pura", () => {
    expect(catalogHref({})).toBe("/produtos")
    expect(catalogHref({ page: 1 })).toBe("/produtos")
  })

  it("ordem fixa: categoria, busca, página", () => {
    expect(catalogHref({ page: 3, query: " fone ", category: "fones" })).toBe(
      "/produtos?categoria=fones&q=fone&pagina=3",
    )
  })

  it("codifica acento e espaço", () => {
    expect(catalogHref({ category: "películas" })).toBe("/produtos?categoria=pel%C3%ADculas")
  })
})
