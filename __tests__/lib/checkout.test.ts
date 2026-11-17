import { describe, expect, it } from "vitest"
import {
  buildCheckout,
  CHECKOUT_FALLBACK_MESSAGE,
  checkoutErrorMessage,
  EMPTY_ADDRESS,
  isCartError,
  newOrderId,
  ORDER_ID_PATTERN,
  quotableAddress,
} from "@/lib/checkout"

const cart = [
  { productId: "p1", slug: "capa", name: "Capa", priceCents: 4990, quantity: 2, maxQuantity: 5 },
]
const form = {
  name: " Maria  Souza ",
  phone: "(34) 99999-1234",
  email: " Maria@Exemplo.com ",
  fulfillment: "pickup" as const,
  address: EMPTY_ADDRESS,
}

describe("checkout do site", () => {
  it("gera id de pedido no formato do admin, sem viés no sorteio", () => {
    expect(newOrderId()).toMatch(ORDER_ID_PATTERN)
    // Bytes ≥ 248 são descartados; 0 vira "A".
    let call = 0
    const id = newOrderId((size) => new Uint8Array(size).fill(call++ === 0 ? 255 : 0))
    expect(id).toBe("A".repeat(20))
  })

  it("monta o pedido de retirada com os dados limpos e o preço visto", () => {
    expect(buildCheckout(cart, form)).toEqual({
      ok: true,
      payload: {
        items: [{ productId: "p1", quantity: 2, unitPrice: 4990 }],
        customer: { name: "Maria Souza", phone: "34999991234", email: "maria@exemplo.com" },
        fulfillment: { type: "pickup" },
      },
    })
  })

  it("entrega exige CEP, rua e número", () => {
    const result = buildCheckout(cart, {
      ...form,
      fulfillment: "delivery",
      address: { ...EMPTY_ADDRESS, cep: "384" },
    })
    expect(result).toEqual({
      ok: false,
      errors: { cep: expect.any(String), street: expect.any(String), number: expect.any(String) },
    })
    const ok = buildCheckout(cart, {
      ...form,
      fulfillment: "delivery",
      address: { ...EMPTY_ADDRESS, cep: "38408-100", street: " Rua A ", number: "10", state: "mg" },
    })
    expect(ok.ok && ok.payload.fulfillment).toEqual({
      type: "delivery",
      address: {
        cep: "38408100",
        street: "Rua A",
        number: "10",
        complement: "",
        district: "",
        city: "",
        state: "MG",
      },
    })
  })

  it("aponta cada campo inválido e o carrinho vazio", () => {
    expect(buildCheckout([], { ...form, name: "Ana", phone: "123", email: "x" })).toEqual({
      ok: false,
      errors: {
        items: expect.any(String),
        name: expect.any(String),
        phone: expect.any(String),
        email: expect.any(String),
      },
    })
  })

  it("traduz o código do admin; mensagem de negócio específica vale mais", () => {
    expect(checkoutErrorMessage("PRICE_CHANGED", "O preço de Capa mudou para R$ 54,90.")).toBe(
      "O preço de Capa mudou para R$ 54,90.",
    )
    expect(checkoutErrorMessage("PRICE_CHANGED", undefined)).toMatch(/preço/)
    expect(checkoutErrorMessage("STOCK_INSUFFICIENT", undefined)).toMatch(/estoque/)
    expect(checkoutErrorMessage("PRODUCT_UNAVAILABLE", undefined)).toMatch(/não está mais à venda/)
    expect(checkoutErrorMessage("DELIVERY_UNAVAILABLE", undefined)).toMatch(/retirada/)
    expect(checkoutErrorMessage("MP_UNAVAILABLE", "detalhe")).toMatch(/Mercado Pago/)
    expect(checkoutErrorMessage("INVALID_REQUEST", undefined)).toMatch(/formulário/)
    expect(checkoutErrorMessage("SITE_UNAUTHORIZED", "Site não autorizado.")).toBe(
      CHECKOUT_FALLBACK_MESSAGE,
    )
    expect(isCartError("PRICE_CHANGED")).toBe(true)
    expect(isCartError("DELIVERY_UNAVAILABLE")).toBe(false)
  })

  it("frete: traduz os códigos do Google e manda o frete visto no pedido", () => {
    expect(checkoutErrorMessage("DELIVERY_ADDRESS_NOT_FOUND", undefined)).toMatch(/no mapa/)
    expect(
      checkoutErrorMessage("DELIVERY_ADDRESS_NOT_FOUND", "Não encontramos Rua A, 10 no mapa."),
    ).toBe("Não encontramos Rua A, 10 no mapa.")
    expect(checkoutErrorMessage("DELIVERY_QUOTE_FAILED", undefined)).toMatch(/WhatsApp/)
    const address = {
      cep: "38408-100",
      street: " Rua A ",
      number: " 10 ",
      complement: "",
      district: "",
      city: "Uberlândia",
      state: "mg",
    }
    const built = buildCheckout(cart, { ...form, fulfillment: "delivery", address }, 1000)
    expect(built.ok && built.payload.fulfillment).toMatchObject({
      type: "delivery",
      expectedFee: 1000,
    })
    const without = buildCheckout(cart, { ...form, fulfillment: "delivery", address })
    expect(without.ok && "expectedFee" in without.payload.fulfillment).toBe(false)
  })

  it("só calcula frete com CEP completo, rua e número", () => {
    const address = {
      cep: "38408-100",
      street: " Rua A ",
      number: "10",
      complement: " ap 2 ",
      district: "",
      city: "",
      state: "mg",
    }
    expect(quotableAddress(address)).toEqual({
      cep: "38408100",
      street: "Rua A",
      number: "10",
      complement: "ap 2",
      district: "",
      city: "",
      state: "MG",
    })
    expect(quotableAddress({ ...address, cep: "38408" })).toBeNull()
    expect(quotableAddress({ ...address, street: " " })).toBeNull()
    expect(quotableAddress({ ...address, number: "" })).toBeNull()
  })
})
