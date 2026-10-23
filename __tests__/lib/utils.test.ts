import { describe, expect, it } from "vitest"
import { cn, formatPhone, formatPrice } from "@/lib/utils"

describe("utils", () => {
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
