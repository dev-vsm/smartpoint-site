import { renderAppIcon } from "@/lib/app-icon"

// Trocar a marca no admin atualiza os ícones sem deploy.
export const revalidate = 300

/** Aba do navegador (32) e ícones do app instalado (192 e 512, pedidos pelo manifest). */
export function generateImageMetadata() {
  return [32, 192, 512].map((side) => ({
    id: String(side),
    size: { width: side, height: side },
    contentType: "image/png",
  }))
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const side = Number(await id)
  // Na aba o ícone é minúsculo: sem margem e sem fundo, a logo ocupa tudo.
  return side <= 48 ? renderAppIcon(side, 0, { transparent: true }) : renderAppIcon(side, 0.1)
}
