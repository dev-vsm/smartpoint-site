import { describe, expect, it } from "vitest"
import imageLoader from "@/lib/image-loader"
import { localVariantUrl } from "@/lib/image-variants"

const BASE = "https://firebasestorage.googleapis.com/v0/b/acesso-rpido.firebasestorage.app/o/"

describe("localVariantUrl", () => {
  it("troca o PNG pelo WebP gerado com a menor largura suficiente", () => {
    expect(localVariantUrl("/banners/carousel/tela.png", 640)).toBe(
      "/banners/carousel/tela-640.webp",
    )
    expect(localVariantUrl("/banners/carousel/tela.png", 1200)).toBe(
      "/banners/carousel/tela-1600.webp",
    )
    expect(localVariantUrl("/banners/carousel/tela.png", 3840)).toBe(
      "/banners/carousel/tela-2172.webp",
    )
  })

  it("ignora pastas sem versões geradas", () => {
    expect(localVariantUrl("/outro/foto.png", 640)).toBeNull()
  })
})

describe("imageLoader", () => {
  it("entrega a original quando não há variante", () => {
    const logo = `${BASE}site%2Fbrand%2Flogo.png?alt=media&token=x`
    expect(imageLoader({ src: logo, width: 256 })).toBe(logo)
  })
})
