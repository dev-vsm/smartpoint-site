import { describe, expect, it } from "vitest"
import { MAX_HIGHLIGHTS, purchaseHighlights } from "@/lib/purchase-highlights"
import type { SiteNotice } from "@/lib/site-content"
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

const freeDelivery: SiteNotice = {
  text: "Entrega grátis acima de R$ 150",
  detail: "Em toda Uberlândia",
  icon: "entrega",
  tone: "promo",
}

describe("mini cards do topo", () => {
  it("monta os cards a partir do cadastro, sem inventar juros", () => {
    const items = purchaseHighlights(store)
    expect(items.map((item) => item.id)).toEqual(["pagamento", "entrega", "loja", "online"])
    expect(items[0].title).toBe("Até 12x no cartão")
    expect(items[0].detail).toBe("Pix, débito e dinheiro")
    expect(items[2]).toMatchObject({ detail: "Jardim Brasília · Uberlândia" })
    expect(JSON.stringify(items)).not.toContain("sem juros")
  })

  it("só fala em sem juros quando a loja cadastrou", () => {
    const [payment] = purchaseHighlights({
      ...store,
      payment: { ...store.payment, interestFreeInstallments: 6 },
    })
    expect(payment.title).toBe("Até 6x sem juros")
    expect(payment.detail).toBe("ou até 12x · Pix, débito e dinheiro")
  })

  it("põe a oferta do admin primeiro e não repete o card de entrega", () => {
    const items = purchaseHighlights(store, [
      { text: "Entrega em toda Uberlândia", icon: "entrega", tone: "info" },
      freeDelivery,
    ])
    expect(items[0]).toMatchObject({
      tone: "promo",
      title: "Entrega grátis acima de R$ 150",
      detail: "Em toda Uberlândia",
    })
    expect(items.map((item) => item.id)).not.toContain("entrega")
    expect(items.filter((item) => item.tone === "promo")).toHaveLength(1)
  })

  it("limita a quantidade de cards", () => {
    const items = purchaseHighlights({ ...store, warranty: "90 dias" }, [freeDelivery])
    expect(items).toHaveLength(MAX_HIGHLIGHTS)
  })

  it("não cria card para dado ausente", () => {
    expect(purchaseHighlights(FALLBACK_STORE)).toEqual([])
  })
})
