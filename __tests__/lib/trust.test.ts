import { describe, expect, it } from "vitest"
import { FALLBACK_STORE, type SiteStore } from "@/lib/store-rules"
import { defaultNotices, installmentsText, trustItems } from "@/lib/trust"

const store: SiteStore = {
  ...FALLBACK_STORE,
  city: "Uberlândia",
  district: "Jardim Brasília",
  payment: {
    methods: ["credit", "debit", "pix_maquina", "payment_link"],
    maxInstallments: 12,
    interestFreeInstallments: 1,
    minInstallmentCents: 0,
  },
}

describe("parcelamento", () => {
  it("só fala em sem juros quando há", () => {
    expect(installmentsText(store.payment)).toBe("em até 12x")
    expect(installmentsText({ ...store.payment, interestFreeInstallments: 3 })).toBe(
      "em até 3x sem juros (até 12x no total)",
    )
    expect(installmentsText({ ...store.payment, maxInstallments: 1 })).toBeUndefined()
    expect(installmentsText({ ...store.payment, methods: ["debit"] })).toBeUndefined()
  })
})

describe("itens de confiança", () => {
  it("saem dos dados da loja, na ordem retirada → entrega → pagamento → garantia", () => {
    expect(trustItems(store, { warranty: "90 dias" })).toEqual([
      { icon: "loja", title: "Retire na loja", detail: "Jardim Brasília, Uberlândia" },
      {
        icon: "entrega",
        title: "Entrega em toda Uberlândia",
        detail: "Combine o horário pelo WhatsApp",
      },
      { icon: "cartao", title: "Aceitamos cartões", detail: "Crédito em até 12x e débito" },
      { icon: "pix", title: "Pix", detail: "Aprovação na hora" },
      { icon: "online", title: "Pagamento online", detail: "Link do Mercado Pago" },
      { icon: "garantia", title: "Garantia", detail: "90 dias" },
    ])
  })

  it("o que não está cadastrado não vira promessa", () => {
    expect(trustItems(FALLBACK_STORE)).toEqual([])
  })

  it("avisos padrão do cabeçalho", () => {
    expect(defaultNotices(store).map((notice) => notice.text)).toEqual([
      "Entrega em toda Uberlândia",
      "Aceitamos cartões em até 12x",
      "Pagamento online pelo Mercado Pago",
    ])
  })
})
