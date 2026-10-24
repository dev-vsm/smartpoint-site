import { renderAppIcon } from "@/lib/app-icon"

export const revalidate = 300

// iPhone e iPad ("Adicionar à Tela de Início"): 180×180, fundo opaco — o iOS
// pinta de preto o que for transparente e arredonda os cantos sozinho.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return renderAppIcon(size.width, 0.12)
}
