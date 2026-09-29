import "server-only"
import type { SubmenuItem } from "@/components/layout/header"
import { listCategories } from "@/lib/catalog"

/** Categorias do catálogo como submenu da vitrine. */
export async function catalogSubmenu(): Promise<SubmenuItem[]> {
  const categories = await listCategories()
  return [
    {
      label: "Todos os produtos",
      href: "/produtos",
      match: { param: "categoria", value: null },
    },
    ...categories.map((category) => ({
      label: category.name,
      count: category.count,
      href: `/produtos?categoria=${encodeURIComponent(category.name)}`,
      match: { param: "categoria", value: category.name },
    })),
  ]
}
