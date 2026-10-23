import { describe, expect, it } from "vitest"
import { toHomeContent } from "@/lib/home-content"

describe("siteContent/home", () => {
  it("lê o formato do admin e trata vazio como ausente", () => {
    const home = toHomeContent({
      hero: { title: "Acessórios", subtitle: "retire hoje", image: "", ctaLabel: "", ctaHref: "" },
      testimonials: [],
    })
    expect(home).toEqual({
      hero: {
        title: "Acessórios",
        subtitle: "retire hoje",
        image: undefined,
        ctaLabel: undefined,
        ctaHref: undefined,
      },
      testimonials: [],
    })
  })

  it("sem título não há abertura; depoimento precisa de nome e texto", () => {
    const home = toHomeContent({
      hero: { title: " " },
      testimonials: [
        { name: "Ana", text: "Ótimo atendimento", rating: 5 },
        { author: "Bruno", quote: "Chegou rápido", rating: 9 },
        { name: "Sem texto" },
      ],
    })
    expect(home.hero).toBeUndefined()
    expect(home.testimonials).toEqual([
      { name: "Ana", text: "Ótimo atendimento", rating: 5 },
      { name: "Bruno", text: "Chegou rápido" },
    ])
  })
})
