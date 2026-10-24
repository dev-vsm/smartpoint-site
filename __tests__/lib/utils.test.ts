import { describe, expect, it } from "vitest"
import { cn, formatPhone, formatPrice, isSvgUrl } from "@/lib/utils"

describe("utils", () => {
  it("reconhece SVG do Storage mesmo com query na URL", () => {
    expect(
      isSvgUrl(
        "https://firebasestorage.googleapis.com/v0/b/x.app/o/site%2Fbrand%2Flogo.svg?alt=media&token=abc",
      ),
    ).toBe(true)
    expect(isSvgUrl("https://x.app/o/site%2Fbrand%2Flogo.png?alt=media")).toBe(false)
    expect(isSvgUrl("/logo.SVG")).toBe(true)
  })

  it("junta classes e descarta o que for falso", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b")
  })

  it("formata centavos em reais", () => {
    expect(formatPrice(7990)).toBe("R$ 79,90")
    expect(formatPrice(0)).toBe("R$ 0,00")
  })

  it("formata telefone com ou sem o código do país", () => {
    expect(formatPhone("5534998349528")).toBe("(34) 99834-9528")
    expect(formatPhone("(34) 3232-1010")).toBe("(34) 3232-1010")
    expect(formatPhone("3432321010")).toBe("(34) 3232-1010")
    expect(formatPhone("0800 123")).toBe("0800 123")
  })
})
