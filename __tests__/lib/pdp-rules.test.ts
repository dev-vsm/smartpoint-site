import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }))

import { compatibilityOf, pickComplements, type SiteProduct } from "@/lib/catalog-rules"
import { toStoreReviews } from "@/lib/google-reviews"

const product = (overrides: Partial<SiteProduct>): SiteProduct => ({
  id: "p",
  slug: "p",
  name: "Produto",
  media: [],
  priceCents: 1000,
  stock: 5,
  specs: [],
  availability: "in_stock",
  highlight: false,
  totalSold: 0,
  order: 0,
  ...overrides,
})

describe("compatibilidade", () => {
  it("vem da característica Modelo ou Compatibilidade, sem acento ou caixa", () => {
    expect(
      compatibilityOf(
        product({
          specs: [
            { name: "Cor", value: "Preto" },
            { name: "Modelo", value: " Galaxy S24 " },
          ],
        }),
      ),
    ).toBe("Galaxy S24")
    expect(
      compatibilityOf(product({ specs: [{ name: "COMPATIBILIDADE", value: "iPhone 15" }] })),
    ).toBe("iPhone 15")
    expect(compatibilityOf(product({ specs: [{ name: "Cor", value: "Preto" }] }))).toBeUndefined()
  })
})

describe("compre junto", () => {
  const capa = product({
    id: "capa",
    subcategoryId: "capas",
    specs: [{ name: "Modelo", value: "Galaxy S24" }],
  })
  const pelicula = product({
    id: "pel",
    subcategoryId: "peliculas",
    totalSold: 10,
    specs: [{ name: "Modelo", value: "galaxy s24" }],
  })
  const pelicula2 = product({
    id: "pel2",
    subcategoryId: "peliculas",
    totalSold: 50,
    specs: [{ name: "Compatibilidade", value: "Galaxy S24" }],
  })
  const outraCapa = product({
    id: "capa2",
    subcategoryId: "capas",
    specs: [{ name: "Modelo", value: "Galaxy S24" }],
  })
  const outroModelo = product({
    id: "pel3",
    subcategoryId: "peliculas",
    specs: [{ name: "Modelo", value: "iPhone 15" }],
  })
  const esgotada = product({
    id: "pel4",
    subcategoryId: "peliculas",
    availability: "sold_out",
    stock: 0,
    specs: [{ name: "Modelo", value: "Galaxy S24" }],
  })
  const catalog = [capa, pelicula, pelicula2, outraCapa, outroModelo, esgotada]

  it("complementos do mesmo modelo, de outra categoria, com estoque, os mais vendidos primeiro", () => {
    expect(pickComplements(capa, catalog).map((item) => item.id)).toEqual(["pel2", "pel"])
    expect(pickComplements(capa, catalog, 1).map((item) => item.id)).toEqual(["pel2"])
  })

  it("sem modelo no produto, não sugere nada", () => {
    expect(pickComplements(product({ id: "x" }), catalog)).toEqual([])
  })
})

describe("avaliações do Google (vindas do admin)", () => {
  it("aceita a nota, o total e os comentários com texto; links só https", () => {
    expect(
      toStoreReviews({
        rating: 4.9,
        count: 132,
        url: "https://maps.google.com/?cid=1",
        reviews: [
          {
            author: "Ana",
            authorUrl: "https://g/ana",
            rating: 5,
            text: " Ótimo! ",
            when: "há 2 semanas",
          },
          { author: "Bia", authorUrl: "javascript:alert(1)", rating: 4, text: "Bom", when: "" },
          { author: "Caio", rating: 5, text: "  ", when: "" },
        ],
      }),
    ).toEqual({
      rating: 4.9,
      count: 132,
      url: "https://maps.google.com/?cid=1",
      reviews: [
        {
          author: "Ana",
          authorUrl: "https://g/ana",
          rating: 5,
          text: "Ótimo!",
          when: "há 2 semanas",
        },
        { author: "Bia", rating: 4, text: "Bom", when: "" },
      ],
    })
  })

  it("sem nota, nota fora de 1–5 ou sem dados: esconde a seção", () => {
    expect(toStoreReviews(null)).toBeNull()
    expect(toStoreReviews({ rating: 0, count: 10 })).toBeNull()
    expect(toStoreReviews({ rating: 7, count: 10 })).toBeNull()
    expect(toStoreReviews({ rating: 4.5, count: 0 })).toBeNull()
  })
})
