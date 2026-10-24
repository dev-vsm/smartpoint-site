import { type ReactNode, Suspense } from "react"
import { HeaderFrame } from "@/components/layout/header-frame"
import { SearchField } from "@/components/layout/search-field"

/**
 * Duas linhas: os mini cards (a marca da loja primeiro, depois as vantagens) e,
 * embaixo, só a busca — centralizada, com largura para cerca de 100 caracteres.
 * A logo e as redes sociais ficam no slide da loja do carrossel; o WhatsApp é o
 * botão flutuante.
 */
export function Header({ benefits }: { benefits?: ReactNode }) {
  return (
    <HeaderFrame>
      <div className="mx-auto max-w-site px-3 py-2 sm:px-4">
        {benefits}
        <div className="mx-auto mt-2 w-full max-w-[100ch]">
          <Suspense fallback={<div className="h-11 rounded-sm bg-brand-soft" />}>
            <SearchField />
          </Suspense>
        </div>
      </div>
    </HeaderFrame>
  )
}
