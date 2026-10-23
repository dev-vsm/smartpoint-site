import { describe, expect, it } from "vitest"
import { buildStoreMap } from "@/lib/maps"

const address = {
  addressLine: "Av. João Pinheiro, 337 — Centro",
  cityLine: "Uberlândia, MG",
}

describe("buildStoreMap", () => {
  it("monta o embed a partir do endereço, sem chave de API", () => {
    const map = buildStoreMap(address)
    const query = encodeURIComponent("Av. João Pinheiro, 337, Centro, Uberlândia, MG")
    expect(map).toEqual({
      embedUrl: `https://www.google.com/maps?q=${query}&output=embed`,
      linkUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
    })
  })

  it("inclui o CEP quando existe", () => {
    const map = buildStoreMap({ ...address, postalCode: "38400-000" })
    expect(map?.embedUrl).toContain(encodeURIComponent("MG, 38400-000"))
  })

  it("o embed e o link cadastrados vencem o endereço", () => {
    const embed = "https://www.google.com/maps/embed?pb=!1m18"
    const share = "https://maps.app.goo.gl/abc123"
    expect(buildStoreMap({ ...address, mapsEmbedUrl: embed, mapsUrl: share })).toEqual({
      embedUrl: embed,
      linkUrl: share,
    })
  })

  it("só o link cadastrado: o mapa segue pelo endereço", () => {
    const share = "https://maps.app.goo.gl/abc123"
    const map = buildStoreMap({ ...address, mapsUrl: share })
    expect(map?.linkUrl).toBe(share)
    expect(map?.embedUrl).toContain("output=embed")
  })

  it("embed colado no campo do link ainda vira o iframe", () => {
    const embed = "https://www.google.com/maps/embed?pb=!1m18"
    expect(buildStoreMap({ ...address, mapsUrl: embed })?.embedUrl).toBe(embed)
  })

  it("sem endereço, o embed sozinho basta", () => {
    const embed = "https://www.google.com/maps/embed?pb=!1m18"
    expect(buildStoreMap({ addressLine: "", cityLine: "", mapsEmbedUrl: embed })).toEqual({
      embedUrl: embed,
      linkUrl: embed,
    })
  })

  it("sem endereço nem embed, não há mapa", () => {
    expect(buildStoreMap({ addressLine: "", cityLine: "" })).toBeUndefined()
    expect(
      buildStoreMap({ addressLine: "", cityLine: "", mapsUrl: "https://maps.app.goo.gl/x" }),
    ).toBeUndefined()
  })
})
