import type { ReactNode } from "react"

/** Moldura visual do navheader, que rola junto com o conteúdo. */
export function HeaderFrame({ children }: { children: ReactNode }) {
  return (
    <header className="border-b border-line bg-paper shadow-sm shadow-ink/5">{children}</header>
  )
}
