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
        className="flex h-11 min-w-0 items-stretch overflow-hidden rounded-sm bg-brand-soft/60 ring-1 ring-inset ring-line transition-colors focus-within:bg-paper focus-within:ring-2 focus-within:ring-brand-strong"
      >
        <label htmlFor="busca" className="sr-only">
          Buscar produtos
        </label>
        <input
          id="busca"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Buscar capinha, película, fone…"
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none focus-visible:outline-none sm:px-3"
        />
        <button
          type="submit"
          aria-label="Buscar produtos"
          className="flex w-11 shrink-0 self-stretch items-center justify-center gap-2 bg-brand-strong text-paper transition-colors hover:bg-brand-deep focus-visible:-outline-offset-4 lg:w-auto lg:px-4"
        >
          <SearchIcon />
          <span className="hidden text-sm font-semibold lg:inline">Buscar</span>
        </button>
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
      className="h-4 w-4"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m14 14 4 4" strokeLinecap="round" />
    </svg>
  )
}
