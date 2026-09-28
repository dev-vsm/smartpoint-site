import { describe, expect, it } from "vitest"
import { productMessage, quoteMessage } from "@/lib/messages"

describe("mensagens do WhatsApp", () => {
  it("produto: nome, variação, preço e link", () => {
    expect(
      productMessage({
        name: "Capa anti-impacto iPhone 15",
        variant: "Preto",
        priceCents: 7990,
        url: "https://capinhasudi.com.br/produtos/capa-iphone-15",
      }),
    ).toBe(
      "Olá! Tenho interesse em Capa anti-impacto iPhone 15 (Preto).\n" +
        "Preço no site: R$ 79,90.\n" +
        "https://capinhasudi.com.br/produtos/capa-iphone-15",
    )
  })

  it("produto sem variação nem preço fica só com o nome", () => {
    expect(productMessage({ name: "Película 3D" })).toBe("Olá! Tenho interesse em Película 3D.")
  })

  it("orçamento junta serviço, aparelho e problema", () => {
    expect(
      quoteMessage({ device: "iPhone 13", service: "Troca de tela", problem: "Caiu e trincou" }),
    ).toBe(
      "Olá! Quero um orçamento de troca de tela.\nAparelho: iPhone 13.\nO que está acontecendo: Caiu e trincou",
    )
  })

  it("orçamento ignora campos vazios", () => {
    expect(quoteMessage({ device: "Moto G", service: "Troca de bateria", problem: "  " })).toBe(
      "Olá! Quero um orçamento de troca de bateria.\nAparelho: Moto G.",
    )
  })
})
