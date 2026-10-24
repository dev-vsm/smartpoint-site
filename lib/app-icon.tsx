import "server-only"
import { ImageResponse } from "next/og"
import { getStore } from "@/lib/store"
import { brandColor } from "@/lib/store-rules"

/** Formatos que o gerador de imagem (Satori) sabe desenhar — WebP fica de fora. */
const SUPPORTED = new Set(["image/svg+xml", "image/png", "image/jpeg", "image/gif"])

/** Baixa a marca do Storage e embute na imagem; qualquer falha cai no ícone de letra. */
async function asDataUri(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { next: { revalidate: 300 } })
    if (!response.ok) return undefined
    const type = response.headers.get("content-type")?.split(";")[0].trim() ?? ""
    if (!SUPPORTED.has(type)) return undefined
    const base64 = Buffer.from(await response.arrayBuffer()).toString("base64")
    return `data:${type};base64,${base64}`
  } catch {
    return undefined
  }
}

/**
 * Ícone quadrado do site (aba, tela inicial, app instalado), gerado a partir de
 * `settings/store.brand` — nada de arquivo de marca no repositório (D13).
 * Usa o ícone quadrado se houver; senão, a logo centralizada sobre branco.
 * Sem nenhuma das duas, a inicial da loja sobre a cor da marca.
 *
 * `padding` é a folga em cada lado, em fração do tamanho: os ícones "maskable"
 * do Android são recortados em círculo e precisam de margem maior. `transparent`
 * tira o fundo branco — na aba a logo aparece solta, como num site qualquer.
 */
export async function renderAppIcon(
  size: number,
  padding: number,
  { transparent = false }: { transparent?: boolean } = {},
): Promise<ImageResponse> {
  const store = await getStore()
  const source = store.brand.iconUrl || store.brand.logoUrl
  const image = source ? await asDataUri(source) : undefined
  const inner = Math.round(size * (1 - padding * 2))

  return new ImageResponse(
    image ? (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: transparent ? "transparent" : "#ffffff",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: imagem desenhada pelo Satori, não vai para o HTML */}
        <img
          src={image}
          alt=""
          width={inner}
          height={inner}
          style={{ width: inner, height: inner, objectFit: "contain" }}
        />
      </div>
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brandColor(store),
          color: "#ffffff",
          fontSize: Math.round(inner * 0.8),
          fontWeight: 700,
        }}
      >
        {store.name.trim().charAt(0).toUpperCase() || "S"}
      </div>
    ),
    { width: size, height: size },
  )
}
