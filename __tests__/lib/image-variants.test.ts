import { describe, expect, it } from "vitest"
import imageLoader from "@/lib/image-loader"
import { firebaseVariantUrl, localVariantUrl } from "@/lib/image-variants"

const BASE = "https://firebasestorage.googleapis.com/v0/b/acesso-rpido.firebasestorage.app/o/"
const PRODUCT = `${BASE}products%2F1754422636374_IMG_4515.jpeg?alt=media&token=abc`
const variant = (size: string) =>
  `${BASE}${encodeURIComponent(`products/1754422636374_IMG_4515_${size}.webp`)}?alt=media`

describe("firebaseVariantUrl", () => {
  it("escolhe pela altura da caixa: foto vertical num card quadrado precisa da altura toda", () => {
    expect(firebaseVariantUrl(PRODUCT, 64)).toBe(variant("96x96"))
    expect(firebaseVariantUrl(PRODUCT, 256)).toBe(variant("256x256"))
    // 384 px de caixa: a de 400x300 só teria 300 de altura, então vai a de 900.
    expect(firebaseVariantUrl(PRODUCT, 384)).toBe(variant("1200x900"))
  })

  it("usa a maior variante quando nenhuma basta", () => {
    expect(firebaseVariantUrl(PRODUCT, 3840)).toBe(variant("1200x900"))
  })

  it("tira o token: as variantes têm token próprio, e a leitura é pública", () => {
    expect(firebaseVariantUrl(PRODUCT, 256)).not.toContain("token")
  })

  it("ignora o que não tem variante", () => {
    expect(firebaseVariantUrl(`${BASE}site%2Fbrand%2Flogo.png?alt=media&token=x`, 256)).toBeNull()
    expect(firebaseVariantUrl(`${BASE}products%2Ficone.svg?alt=media`, 256)).toBeNull()
    expect(firebaseVariantUrl("https://exemplo.com/products/foto.jpg", 256)).toBeNull()
    expect(firebaseVariantUrl("/banners/carousel/tela.png", 256)).toBeNull()
  })
})

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
