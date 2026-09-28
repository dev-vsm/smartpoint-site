"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Busca do cabeçalho: vale em qualquer página e sempre leva para a vitrine
 * (`/produtos?q=`). A URL guarda a busca — dá para compartilhar o resultado.
 * O `<search>` é o landmark; quem submete é o `<form>` dentro dele.
 */
export function SearchField({ className }: { className?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState(params.get("q") ?? "")

  // Voltar/avançar no navegador precisa refletir no campo.
  useEffect(() => {
    setValue(params.get("q") ?? "")
  }, [params])

  return (
    <search className={cn("min-w-0", className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const query = value.trim()
          router.push(query ? `/produtos?q=${encodeURIComponent(query)}` : "/produtos")
        }}
        className="relative flex min-w-0 items-center"
      >
        <label htmlFor="busca" className="sr-only">
          Buscar produtos
        </label>
        <SearchIcon />
        <input
          id="busca"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Buscar capinha, película, fone…"
          className="min-h-11 w-full rounded-sm border border-line bg-shelf pl-9 pr-3 text-sm outline-none transition-colors focus:border-ink focus:bg-paper"
        />
      </form>
    </search>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="pointer-events-none absolute left-3 h-4 w-4 text-ink-soft"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m14 14 4 4" strokeLinecap="round" />
    </svg>
  )
}
