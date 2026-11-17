import { describe, expect, it } from "vitest"
import { cardChips } from "@/lib/catalog-rules"
import type { StorePayment } from "@/lib/store-rules"
import { installmentOffer, proofBadge } from "@/lib/trust"

const payment: StorePayment = {
  methods: ["credit", "debit", "pix_chave"],
  maxInstallments: 12,
  interestFreeInstallments: 3,
  minInstallmentCents: 0,
}

describe("parcela do card", () => {
  it("sem juros: divide pelas parcelas sem juros e arredonda a parcela para cima", () => {
    expect(installmentOffer(5990, payment)).toEqual({
      count: 3,
      interestFree: true,
      valueCents: 1997,
    })
    expect(installmentOffer(3000, payment)).toEqual({
      count: 3,
      interestFree: true,
      valueCents: 1000,
    })
  })

  it("respeita a parcela mínima e não parcela produto barato demais", () => {
    const min = { ...payment, minInstallmentCents: 1000 }
    expect(installmentOffer(2490, min)).toEqual({ count: 2, interestFree: true, valueCents: 1245 })
    expect(installmentOffer(1500, min)).toBeNull()
  })

  it("sem parcelas sem juros, só o número de vezes (os juros não são da loja)", () => {
    expect(installmentOffer(5990, { ...payment, interestFreeInstallments: 1 })).toEqual({
      count: 12,
      interestFree: false,
    })
  })

  it("sem crédito ou só à vista, nada", () => {
    expect(installmentOffer(5990, { ...payment, methods: ["pix_chave"] })).toBeNull()
    expect(installmentOffer(5990, { ...payment, maxInstallments: 1 })).toBeNull()
  })
})

describe("selo de prova do card", () => {
  it("vendidos arredondados para baixo, a partir de 10", () => {
    expect(proofBadge({ totalSold: 9 })).toBeNull()
    expect(proofBadge({ totalSold: 10 })).toEqual({ text: "+10 vendidos" })
    expect(proofBadge({ totalSold: 57 })).toEqual({ text: "+50 vendidos" })
    expect(proofBadge({ totalSold: 427 })).toEqual({ text: "+400 vendidos" })
  })
})

describe("chips de características do card", () => {
  it("até 2, sem vazios, repetidos ou o que já está no nome", () => {
    const spec = (value: string) => ({ name: "x", value })
    expect(
      cardChips(
        [
          spec("Uchiha Madara"),
          spec("Anime"),
          spec("anime"),
          spec(" "),
          spec("30 cm"),
          spec("Azul"),
        ],
        "Uchiha Madara",
      ),
    ).toEqual(["Anime", "30 cm"])
    expect(cardChips([spec("USB-C")], "Carregador Turbo 20W")).toEqual(["USB-C"])
    expect(cardChips([], "Capa")).toEqual([])
  })
})
