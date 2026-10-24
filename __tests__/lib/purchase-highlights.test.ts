import { describe, expect, it } from "vitest"
import { purchaseHighlights } from "@/lib/purchase-highlights"
import { FALLBACK_STORE, type SiteStore } from "@/lib/store-rules"

const store: SiteStore = {
  ...FALLBACK_STORE,
  city: "Uberlândia",
  district: "Jardim Brasília",
  payment: {
    methods: ["credit", "debit", "pix_maquina", "pix_chave", "cash", "payment_link"],
    maxInstallments: 12,
    interestFreeInstallments: 1,
    minInstallmentCents: 0,
  },
}

describe("destaques de compra", () => {
  it("agrupa o cadastro em pagamento, localização e link sem inventar juros ou garantia", () => {
    const items = purchaseHighlights(store)
    expect(items.map((item) => item.id)).toEqual(["pagamento", "loja", "online"])
    expect(items[0].title).toBe("até 12x")
    expect(items[0].detail).toBe("No cartão de crédito. Aceitamos Pix, débito, dinheiro.")
    expect(items[1].detail).toContain("Jardim Brasília")
    expect(JSON.stringify(items)).not.toContain("sem juros")
  })
  it("expõe os limites de parcelamento e a garantia somente quando cadastrados", () => {
    const items = purchaseHighlights({
      ...store,
      warranty: "90 dias",
      payment: { ...store.payment, interestFreeInstallments: 6, minInstallmentCents: 5000 },
    })
    expect(items[0].title).toBe("até 6x sem juros (até 12x no total)")
    expect(items[0].detail).toContain("50,00")
    expect(items.find((item) => item.id === "garantia")?.detail).toBe("90 dias")
  })
  it("não cria benefícios para dados ausentes", () => {
    expect(purchaseHighlights(FALLBACK_STORE)).toEqual([])
  })
})
