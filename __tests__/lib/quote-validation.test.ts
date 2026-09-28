import { describe, expect, it } from "vitest"
import { validateQuote } from "@/lib/quote-validation"

describe("validação do orçamento", () => {
  it("exige aparelho e serviço", () => {
    const { errors, data } = validateQuote({ device: " ", service: "" })
    expect(data).toBeUndefined()
    expect(errors.device).toBeTruthy()
    expect(errors.service).toBeTruthy()
  })

  it("limpa espaços e descarta campos opcionais vazios", () => {
    const { data } = validateQuote({
      device: "  iPhone 13 ",
      service: "Troca de tela",
      problem: "   ",
      name: "",
    })
    expect(data).toEqual({ device: "iPhone 13", service: "Troca de tela" })
  })

  it("recusa texto absurdamente longo", () => {
    const { errors } = validateQuote({
      device: "Moto G",
      service: "Troca de bateria",
      problem: "a".repeat(601),
    })
    expect(errors.problem).toBeTruthy()
  })
})
