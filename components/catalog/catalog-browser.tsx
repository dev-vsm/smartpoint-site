"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ui/product-card"
import type { SiteProduct } from "@/lib/catalog-rules"

/**
 * Vitrine com busca e filtro. O catálogo inteiro já vem renderizado do servidor
 * (é pequeno), então filtrar é instantâneo e não gera requisição nenhuma.
 */
export function CatalogBrowser({ products }: { products: SiteProduct[] }) {
  const router = useRouter()
  const params = useSearchParams()
  // Busca e categoria vêm do cabeçalho e vivem na URL compartilhável.
  const query = params.get("q") ?? ""
  const category = params.get("categoria")

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean)
    return products.filter((product) => {
      if (category && product.category !== category) return false
      if (!terms.length) return true
      const haystack = normalize(
        [product.name, product.category, product.brand].filter(Boolean).join(" "),
      )
      return terms.every((term) => haystack.includes(term))
    })
  }, [products, query, category])

  return (
    <div>
      {/* O submenu do cabeçalho já diz a categoria: aqui o título só serve ao
          leitor de tela e ao Google. */}
      <h1 className="sr-only">{category || "Todos os produtos"}</h1>
      {query && (
        <p className="mb-5 text-sm text-ink-soft">
          Resultados para <strong className="text-ink">{query}</strong>
        </p>
      )}

      {visible.length === 0 ? (
        <div className="rounded-md bg-paper p-6 ring-1 ring-line">
          <p className="text-sm">Nada encontrado com esse filtro.</p>
          <Button variant="outline" className="mt-3" onClick={() => router.push("/produtos")}>
            Limpar busca
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}
