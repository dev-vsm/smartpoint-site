import { describe, expect, it } from "vitest"
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp"

describe("whatsapp", () => {
  it("normaliza o número para o formato do wa.me", () => {
    expect(normalizeWhatsAppNumber("+55 34 99834-9528")).toBe("5534998349528")
    expect(normalizeWhatsAppNumber("5534998349528")).toBe("5534998349528")
  })

  it("monta a url com a mensagem codificada", () => {
    const url = buildWhatsAppUrl("5534998349528", "Olá! Quero a capinha do iPhone 15")
    expect(url).toBe(
      "https://wa.me/5534998349528?text=Ol%C3%A1!%20Quero%20a%20capinha%20do%20iPhone%2015",
    )
  })

  it("sem mensagem, abre a conversa limpa", () => {
    expect(buildWhatsAppUrl("5534998349528")).toBe("https://wa.me/5534998349528")
  })
})
