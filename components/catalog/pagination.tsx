import Link from "next/link"
import { CATALOG_PAGE_SIZES } from "@/lib/catalog-rules"
import { type Page, pageWindow } from "@/lib/pagination"
import { cn } from "@/lib/utils"

/**
 * Paginação numerada, só servidor (zero JS): links de verdade, que funcionam
 * sem hidratar, abrem em nova aba e o Google segue. Traz junto a faixa exibida
 * ("1–24 de 456 produtos") e aparece sempre — com uma página só, os botões
 * ficam inertes, para a pessoa saber que viu tudo.
 *
 * No celular a janela de números encolhe (primeira, atual, última) e Anterior/
 * Próxima viram só a seta: cabe em 320px sem perder o alvo de 44px.
 */
export function Pagination({
  page: { page, totalPages, totalItems, from, to },
  href,
  noun = ["produto", "produtos"],
  perPage,
  pageSizeHref,
  className,
}: {
  page: Pick<Page<unknown>, "page" | "totalPages" | "totalItems" | "from" | "to">
  /** Monta a URL de uma página mantendo os filtros atuais. */
  href: (page: number) => string
  /** Singular e plural do que se conta. */
  noun?: [string, string]
  /** Se informado, mostra o controle de itens por página. */
  perPage?: number
  pageSizeHref?: (size: number) => string
  className?: string
}) {
  if (totalItems === 0) return null

  const prev = page > 1 ? page - 1 : null
  const next = page < totalPages ? page + 1 : null
  const unit = totalItems === 1 ? noun[0] : noun[1]

  // Duas linhas, centralizadas: o contador em cima, a navegação embaixo.
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <p className="text-sm text-ink-soft tabular-nums">
        <span className="font-semibold text-ink">
          {from}–{to}
        </span>{" "}
        de <span className="font-semibold text-ink">{totalItems}</span> {unit}
      </p>

      {perPage && pageSizeHref && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-ink-soft">Itens por página</span>
          <nav aria-label="Itens por página" className="flex items-center gap-1">
            {CATALOG_PAGE_SIZES.map((size) => (
              <Link
                key={size}
                href={pageSizeHref(size)}
                aria-current={size === perPage ? "true" : undefined}
                aria-label={`${size} itens por página`}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-sm px-2 font-semibold tabular-nums transition-colors",
                  size === perPage
                    ? "bg-brand text-brand-ink"
                    : "text-ink-soft hover:bg-brand-soft hover:text-brand-strong",
                )}
              >
                {size}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <nav aria-label="Paginação" className="flex items-center gap-1 sm:gap-2">
        <StepLink target={prev} href={href} label="Anterior" direction="prev" />
        <PageNumbers
          page={page}
          totalPages={totalPages}
          href={href}
          siblings={0}
          className="sm:hidden"
        />
        <PageNumbers
          page={page}
          totalPages={totalPages}
          href={href}
          siblings={1}
          className="hidden sm:flex"
        />
        <StepLink target={next} href={href} label="Próxima" direction="next" />
      </nav>
    </div>
  )
}

function PageNumbers({
  page,
  totalPages,
  href,
  siblings,
  className,
}: {
  page: number
  totalPages: number
  href: (page: number) => string
  siblings: number
  className?: string
}) {
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {pageWindow(page, totalPages, siblings).map((item, index) =>
        item === "…" ? (
          // Duas reticências possíveis: a posição é a chave estável.
          // biome-ignore lint/suspicious/noArrayIndexKey: reticências não têm identidade própria
          <li key={`gap-${index}`} aria-hidden="true" className="w-6 text-center text-ink-soft">
            …
          </li>
        ) : (
          <li key={item}>
            <Link
              href={href(item)}
              aria-label={`Página ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center rounded-sm px-2 text-sm font-semibold tabular-nums transition-colors",
                item === page
                  ? "bg-brand text-brand-ink"
                  : "text-ink-soft hover:bg-brand-soft hover:text-brand-strong",
              )}
            >
              {item}
            </Link>
          </li>
        ),
      )}
    </ul>
  )
}

function StepLink({
  target,
  href,
  label,
  direction,
}: {
  target: number | null
  href: (page: number) => string
  label: string
  direction: "prev" | "next"
}) {
  const style =
    "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-sm border px-2 text-sm font-semibold transition-colors sm:px-3"
  const content = (
    <>
      {direction === "prev" && <Chevron direction="prev" />}
      <span className="sr-only sm:not-sr-only">{label}</span>
      {direction === "next" && <Chevron direction="next" />}
    </>
  )

  // Na primeira/última página o botão fica visível, mas inerte: o layout não pula.
  if (target === null) {
    return (
      <span aria-disabled="true" className={cn(style, "border-line text-ink-soft/60")}>
        {content}
      </span>
    )
  }

  return (
    <Link
      href={href(target)}
      rel={direction}
      aria-label={`${label} página`}
      className={cn(
        style,
        "border-line bg-paper text-brand-strong hover:border-brand-strong hover:bg-brand-soft",
      )}
    >
      {content}
    </Link>
  )
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
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
      <path d={direction === "prev" ? "m12 5-5 5 5 5" : "m8 5 5 5-5 5"} />
    </svg>
  )
}
