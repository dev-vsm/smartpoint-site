import { renderAppIcon } from "@/lib/app-icon"

export const revalidate = 300

/**
 * Ícone "maskable" do Android: o sistema recorta em círculo, gota ou quadrado,
 * então a marca fica dentro da zona segura (80% do centro).
 */
export function GET() {
  return renderAppIcon(512, 0.22)
}
