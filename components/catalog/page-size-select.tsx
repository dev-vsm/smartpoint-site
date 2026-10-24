"use client"

import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Itens por página: botão que abre uma lista no estilo do site — a lista do
 * `<select>` nativo é desenhada pelo sistema e não aceita o tema. Cada opção é
 * um link de verdade (URL montada no servidor, com os filtros atuais). Fecha ao
 * escolher, ao clicar fora e no Esc; setas navegam entre as opções.
 */
export function PageSizeSelect({
  options,
  current,
}: {
  options: Array<{ size: number; href: string }>
  current: number
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    // Ao abrir, o foco vai para a opção atual.
    root.current?.querySelector<HTMLAnchorElement>('[aria-current="true"]')?.focus()
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [open])

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open) return
    const links = [...(root.current?.querySelectorAll<HTMLAnchorElement>("li a") ?? [])]
    const index = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      button.current?.focus()
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const step = event.key === "ArrowDown" ? 1 : -1
      links[(index + step + links.length) % links.length]?.focus()
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: só repassa as teclas do menu aberto
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Itens por página: ${current}`}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-sm border bg-paper px-3 text-sm font-semibold text-ink tabular-nums transition-colors",
          open ? "border-brand-strong" : "border-line hover:border-brand-strong",
        )}
      >
        {current} por página
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn("h-4 w-4 text-brand-strong transition-transform", open && "rotate-180")}
        >
          <path d="m5 8 5 5 5-5" />
        </svg>
      </button>

      <ul
        id={listId}
        hidden={!open}
        className="absolute right-0 bottom-full z-30 mb-1 min-w-full overflow-hidden rounded-md bg-paper py-1 shadow-lg shadow-ink/10 ring-1 ring-line"
      >
        {options.map((option) => {
          const selected = option.size === current
          return (
            <li key={option.size}>
              <Link
                href={option.href}
                scroll={false}
                aria-current={selected ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-10 items-center justify-between gap-3 whitespace-nowrap px-3 text-sm font-semibold tabular-nums transition-colors focus-visible:-outline-offset-2",
                  selected
                    ? "bg-brand-soft text-brand-strong"
                    : "text-ink hover:bg-brand-soft hover:text-brand-strong",
                )}
              >
                {option.size} por página
                {selected && (
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path d="m5 10 3.5 3.5L15 7" />
                  </svg>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
