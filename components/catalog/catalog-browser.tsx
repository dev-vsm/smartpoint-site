"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/field"
import { ProductCard } from "@/components/ui/product-card"
import type { SiteProduct } from "@/lib/catalog-rules"
import { cn } from "@/lib/utils"

/**
 * Vitrine com busca e filtro. O catálogo inteiro já vem renderizado do servidor
 * (é pequeno), então filtrar é instantâneo e não gera requisição nenhuma.
 */
export function CatalogBrowser({
  products,
  categories,
}: {
  products: SiteProduct[]
  categories: Array<{ name: string; count: number }>
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)

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
      <div className="mb-5 space-y-3">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar capinha, película, fone…"
          aria-label="Buscar no catálogo"
        />

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={category === null} onClick={() => setCategory(null)}>
              Tudo
            </FilterChip>
            {categories.map((item) => (
              <FilterChip
                key={item.name}
                active={category === item.name}
                onClick={() => setCategory(category === item.name ? null : item.name)}
              >
                {item.name}
                <span className="opacity-60"> {item.count}</span>
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-md bg-paper p-6 ring-1 ring-line">
          <p className="text-sm">Nada encontrado com esse filtro.</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => {
              setQuery("")
              setCategory(null)
            }}
          >
            Limpar busca
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-soft">
            {visible.length} {visible.length === 1 ? "produto" : "produtos"}
          </p>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {visible.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-sm border px-3 text-sm font-semibold transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
      )}
    >
      {children}
    </button>
  )
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}
