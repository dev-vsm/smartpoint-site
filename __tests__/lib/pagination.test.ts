import { describe, expect, it } from "vitest"
import { pageWindow, paginate, parsePage } from "@/lib/pagination"

describe("parsePage", () => {
  it("ausente é a primeira página", () => {
    expect(parsePage(undefined)).toBe(1)
  })

  it("aceita só inteiro positivo escrito limpo", () => {
    expect(parsePage("3")).toBe(3)
    for (const raw of ["0", "-1", "02", "2.0", "abc", "", "9999999"]) {
      expect(parsePage(raw)).toBeNull()
    }
    expect(parsePage(["1", "2"])).toBeNull()
  })
})

describe("paginate", () => {
  const items = Array.from({ length: 50 }, (_, i) => i + 1)

  it("fatia e informa a faixa exibida", () => {
    expect(paginate(items, 2, 24)).toEqual({
      items: items.slice(24, 48),
      page: 2,
      totalPages: 3,
      totalItems: 50,
      from: 25,
      to: 48,
    })
  })

  it("a última página pode vir incompleta", () => {
    const last = paginate(items, 3, 24)
    expect(last?.items).toEqual([49, 50])
    expect(last?.to).toBe(50)
  })

  it("página além da última não existe", () => {
    expect(paginate(items, 4, 24)).toBeNull()
  })

  it("lista vazia ainda tem a página 1, sem itens", () => {
    expect(paginate([], 1, 24)).toMatchObject({ totalPages: 1, from: 0, to: 0, items: [] })
    expect(paginate([], 2, 24)).toBeNull()
  })
})

describe("pageWindow", () => {
  it("poucas páginas aparecem todas", () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pageWindow(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("perto do começo, reticências só à direita", () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, 3, 4, 5, "…", 20])
    expect(pageWindow(4, 20)).toEqual([1, 2, 3, 4, 5, "…", 20])
  })

  it("no meio, reticências dos dois lados", () => {
    expect(pageWindow(10, 20)).toEqual([1, "…", 9, 10, 11, "…", 20])
  })

  it("perto do fim, reticências só à esquerda", () => {
    expect(pageWindow(20, 20)).toEqual([1, "…", 16, 17, 18, 19, 20])
    expect(pageWindow(17, 20)).toEqual([1, "…", 16, 17, 18, 19, 20])
  })

  it("o número de casas não muda enquanto se navega", () => {
    for (let page = 1; page <= 20; page++) expect(pageWindow(page, 20)).toHaveLength(7)
  })

  it("sem vizinhos (celular): primeira, atual e última", () => {
    expect(pageWindow(1, 19, 0)).toEqual([1, 2, 3, "…", 19])
    expect(pageWindow(10, 19, 0)).toEqual([1, "…", 10, "…", 19])
    expect(pageWindow(19, 19, 0)).toEqual([1, "…", 17, 18, 19])
    for (let page = 1; page <= 19; page++) expect(pageWindow(page, 19, 0)).toHaveLength(5)
  })
})
