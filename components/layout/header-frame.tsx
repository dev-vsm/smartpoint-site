import type { ReactNode } from "react"

/** Moldura visual do navheader, que rola junto com o conteúdo. */
export function HeaderFrame({ children }: { children: ReactNode }) {
  return <header className="bg-paper">{children}</header>
}
