import { describe, expect, it } from "vitest"
import {
  type MediaItem,
  mediaSource,
  parseMedia,
  productCover,
  productImage,
  shareImage,
  storageUrl,
} from "@/lib/product-media"

const BUCKET = "staging.firebasestorage.app"
const url = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media`

const media = (id: string, width: number, height: number, alt?: string): MediaItem => ({
  id,
  type: "image",
  path: `products/p1/${id}.jpg`,
  width,
  height,
  contentType: "image/jpeg",
  size: 1000,
  alt,
  createdAt: "2026-10-01T00:00:00.000Z",
})

/** Larguras do srcset, na ordem. */
const widths = (srcSet: string) =>
  srcSet.split(", ").map((entry) => Number(entry.split(" ")[1].slice(0, -1)))

describe("storageUrl", () => {
  it("monta a URL pública sem token, com o caminho codificado", () => {
    expect(storageUrl("products/p1/abc.jpg", BUCKET)).toBe(
      `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/products%2Fp1%2Fabc.jpg?alt=media`,
    )
    expect(storageUrl("products/p1/abc.jpg", BUCKET)).not.toContain("token")
  })
})

describe("mediaSource", () => {
  it("foto em pé: largura real encaixada em cada caixa", () => {
    const source = mediaSource(media("abc", 3024, 4032), BUCKET)
    // 32x32→24, 48→36, 96→72, 128→96, 256→192, 400x300→225, 1200x900→675, original 3024
    expect(widths(source.srcSet)).toEqual([24, 36, 72, 96, 192, 225, 675, 3024])
    expect(source.srcSet).toContain(`${url("products/p1/abc_400x300.webp")} 225w`)
    expect(source.src).toBe(url("products/p1/abc_1200x900.webp"))
    expect(source.original).toBe(url("products/p1/abc.jpg"))
  })

  it("foto deitada: a caixa 400x300 dá 400 de largura e vira o src", () => {
    const source = mediaSource(media("abc", 4032, 3024), BUCKET)
    expect(widths(source.srcSet)).toEqual([32, 48, 96, 128, 256, 400, 1200, 4032])
    expect(source.src).toBe(url("products/p1/abc_400x300.webp"))
  })

  it("foto menor que as caixas: sem largura repetida e sem passar da original", () => {
    const source = mediaSource(media("abc", 200, 150), BUCKET)
    // 256x256, 400x300 e 1200x900 dariam 200 = original: ficam de fora.
    expect(widths(source.srcSet)).toEqual([32, 48, 96, 128, 200])
    expect(source.srcSet.endsWith(`${url("products/p1/abc.jpg")} 200w`)).toBe(true)
    // Nenhuma chega a 300: o src é a última (a original).
    expect(source.src).toBe(source.original)
  })
})

describe("capa e variações", () => {
  const all = [media("a", 800, 800), media("b", 800, 800), media("c", 800, 800)]

  it("capa do produto = media[0]; sem media, sem capa", () => {
    expect(productCover(all)?.id).toBe("a")
    expect(productCover([])).toBeUndefined()
    expect(parseMedia(undefined)).toEqual([])
  })
})

describe("parseMedia", () => {
  it("descarta itens sem caminho ou sem dimensões", () => {
    const items = parseMedia([
      media("a", 10, 10),
      { id: "b", path: "" },
      null,
      { ...media("c", 0, 10) },
    ])
    expect(items.map((m) => m.id)).toEqual(["a"])
  })
})

describe("productImage", () => {
  it("alt da mídia, ou o nome do produto quando falta", () => {
    expect(productImage(media("a", 10, 10, "Capa azul"), "Capa", BUCKET).alt).toBe("Capa azul")
    expect(productImage(media("a", 10, 10, "  "), "Capa", BUCKET).alt).toBe("Capa")
  })
})

describe("shareImage", () => {
  it("usa a variante 1200x900 com as dimensões reais", () => {
    expect(shareImage(media("a", 3024, 4032), BUCKET)).toEqual({
      url: url("products/p1/a_1200x900.webp"),
      width: 675,
      height: 900,
    })
  })

  it("foto menor que a caixa: usa a original", () => {
    expect(shareImage(media("a", 800, 600), BUCKET)).toEqual({
      url: url("products/p1/a.jpg"),
      width: 800,
      height: 600,
    })
  })
})
