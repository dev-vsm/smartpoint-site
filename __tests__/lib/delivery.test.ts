import { describe, expect, it } from "vitest"
import { deliversAnywhere, deliveryReach, formatKm, toDelivery } from "@/lib/delivery"

describe("faixas de entrega do site", () => {
  it("lê as faixas em ordem de distância e descarta as inválidas", () => {
    expect(
      toDelivery({
        pickup: false,
        ranges: [
          { id: "b", upToKm: 8, fee: 1500 },
          { id: "a", upToKm: "3", fee: 0 },
          { upToKm: 0, fee: 100 },
          { upToKm: 5, fee: -1 },
          "lixo",
        ],
      }),
    ).toEqual({
      pickup: false,
      ranges: [
        { upToKm: 3, fee: 0 },
        { upToKm: 8, fee: 1500 },
      ],
    })
  })

  it("sem faixas (ou no formato antigo por bairro) não há entrega pelo site", () => {
    const old = toDelivery({
      zones: [{ name: "Sul", fee: 1000, districts: ["Centro"] }],
      otherDistrictsFee: 500,
    })
    expect(old).toEqual({ pickup: true, ranges: [] })
    expect(deliversAnywhere(old)).toBe(false)
    expect(deliversAnywhere(toDelivery({ ranges: [{ upToKm: 5, fee: 0 }] }))).toBe(true)
    expect(toDelivery(undefined)).toEqual({ pickup: true, ranges: [] })
  })

  it("resume o alcance e formata km no padrão brasileiro", () => {
    expect(
      deliveryReach(
        toDelivery({
          ranges: [
            { upToKm: 3, fee: 0 },
            { upToKm: 7.5, fee: 900 },
          ],
        }),
      ),
    ).toBe("até 7,5 km da loja")
    expect(deliveryReach(toDelivery({}))).toBe("")
    expect(formatKm(4.25)).toBe("4,3")
    expect(formatKm(6)).toBe("6")
  })
})
