import { NoticeIconArt } from "@/components/layout/notice-strip"
import type { TrustItem } from "@/lib/trust"
import { cn } from "@/lib/utils"

/**
 * Respostas curtas para o que trava a compra (retirada, entrega, pagamento,
 * garantia). `list` empilha, para a página do produto; `bar` vira faixa em
 * grade, para a home.
 */
export function TrustList({
  items,
  variant = "list",
  className,
}: {
  items: TrustItem[]
  variant?: "list" | "bar"
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <ul
      aria-label="Compre com segurança"
      className={cn(
        // No celular a faixa rola de lado (como os destaques) em vez de espremer colunas.
        variant === "bar"
          ? "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]"
          : "grid gap-3 sm:grid-cols-2",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.title}
          className={cn(
            "flex items-start gap-3",
            variant === "bar" &&
              "w-60 shrink-0 snap-start rounded-md bg-paper p-3 ring-1 ring-line sm:w-auto",
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
            <NoticeIconArt name={item.icon} className="h-5 w-5" />
          </span>
          <span className="min-w-0 text-sm">
            <span className="block font-semibold text-ink">{item.title}</span>
            {item.detail && <span className="block text-ink-soft">{item.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}
