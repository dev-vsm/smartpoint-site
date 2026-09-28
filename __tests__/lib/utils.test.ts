import { describe, expect, it } from "vitest"
import { cn, formatPrice } from "@/lib/utils"

describe("utils", () => {
  it("junta classes e descarta o que for falso", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b")
  })

  it("formata centavos em reais", () => {
    expect(formatPrice(7990)).toBe("R$ 79,90")
    expect(formatPrice(0)).toBe("R$ 0,00")
  })
})
