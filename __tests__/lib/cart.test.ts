import { describe, expect, it } from "vitest"
import {
  addItem,
  cartCount,
  cartSubtotal,
  MAX_ITEMS,
  parseCart,
  removeItem,
  setQuantity,
} from "@/lib/cart"

const capa = { productId: "p1", slug: "capa", name: "Capa", priceCents: 4990, maxQuantity: 3 }
const fone = { productId: "p2", slug: "fone", name: "Fone", priceCents: 8990, maxQuantity: 10 }

describe("carrinho", () => {
  it("soma quantidades do mesmo produto sem passar do estoque", () => {
    let cart = addItem([], capa)
    cart = addItem(cart, capa, 5)
    expect(cart).toEqual([{ ...capa, quantity: 3 }])
  })

  it("atualiza preço e estoque quando o mesmo produto volta com dados novos", () => {
    const cart = addItem(addItem([], capa), { ...capa, priceCents: 5490, maxQuantity: 5 })
    expect(cart[0]).toMatchObject({ priceCents: 5490, maxQuantity: 5, quantity: 2 })
  })

  it("não adiciona sem estoque nem acima do limite de produtos", () => {
    expect(addItem([], { ...capa, maxQuantity: 0 })).toEqual([])
    const full = Array.from({ length: MAX_ITEMS }, (_, i) => ({
      ...fone,
      productId: `p${i}`,
      quantity: 1,
    }))
    expect(addItem(full, { ...capa, productId: "novo" })).toBe(full)
  })

  it("muda a quantidade, remove no zero e soma total e itens", () => {
    let cart = addItem(addItem([], capa), fone, 2)
    cart = setQuantity(cart, "p1", 2)
    expect(cartCount(cart)).toBe(4)
    expect(cartSubtotal(cart)).toBe(2 * 4990 + 2 * 8990)
    expect(setQuantity(cart, "p1", 0)).toEqual(removeItem(cart, "p1"))
    expect(setQuantity(cart, "p2", 99)[1].quantity).toBe(10)
  })

  it("lê o guardado e descarta o que não é carrinho", () => {
    expect(parseCart(null)).toEqual([])
    expect(parseCart("{quebrado")).toEqual([])
    expect(parseCart('{"a":1}')).toEqual([])
    const raw = JSON.stringify([
      { ...capa, quantity: 9, image: "x.webp" },
      { productId: "ruim" },
      { ...fone, priceCents: 0, quantity: 1 },
    ])
    expect(parseCart(raw)).toEqual([{ ...capa, quantity: 3, image: "x.webp" }])
  })
})
