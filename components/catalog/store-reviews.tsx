import type { StoreReviews as Reviews } from "@/lib/google-reviews"
import { cn } from "@/lib/utils"

function Stars({ rating, className }: { rating: number; className?: string }) {
  const full = Math.round(rating)
  return (
    <span aria-hidden="true" className={cn("tracking-tight text-tag", className)}>
      {"★".repeat(full)}
      <span className="text-line">{"★".repeat(5 - full)}</span>
    </span>
  )
}

/**
 * Avaliações reais da loja no Google (perfil da empresa): nota, total e até 3 comentários,
 * com o crédito ao Google e o link para ver todas — as regras do Google para exibir avaliações.
 */
export function StoreReviews({
  reviews,
  compact = false,
}: {
  reviews: Reviews
  compact?: boolean
}) {
  const summary = `${reviews.rating.toLocaleString("pt-BR")} de 5 no Google · ${reviews.count} avaliações`

  if (compact) {
    return (
      <p className="flex items-center gap-1.5 text-sm">
        <Stars rating={reviews.rating} />
        <strong>{reviews.rating.toLocaleString("pt-BR")}</strong>
        <span className="text-ink-soft">no Google · {reviews.count} avaliações da loja</span>
      </p>
    )
  }

  return (
    <section aria-labelledby="store-reviews" className="mt-8 border-t border-line pt-6">
      <h2 id="store-reviews" className="text-lg">
        O que dizem da loja
      </h2>
      <p className="mt-1 flex items-center gap-2 text-sm">
        <Stars rating={reviews.rating} className="text-base" />
        <span className="sr-only">{summary}</span>
        <span aria-hidden="true">
          <strong>{reviews.rating.toLocaleString("pt-BR")}</strong>
          <span className="text-ink-soft"> · {reviews.count} avaliações no Google</span>
        </span>
      </p>
      {reviews.reviews.length > 0 && (
        <ul className="mt-4 space-y-3">
          {reviews.reviews.map((review) => (
            <li
              key={`${review.author}-${review.when}`}
              className="rounded-md bg-shelf p-3 ring-1 ring-line"
            >
              <p className="flex flex-wrap items-center gap-x-2 text-sm">
                <strong>
                  {review.authorUrl ? (
                    <a
                      href={review.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {review.author}
                    </a>
                  ) : (
                    review.author
                  )}
                </strong>
                <Stars rating={review.rating} />
                <span className="sr-only">{review.rating} de 5</span>
                {review.when && <span className="text-xs text-ink-soft">{review.when}</span>}
              </p>
              <p className="mt-1 line-clamp-4 text-sm text-ink-soft">{review.text}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-ink-soft">
        Avaliações do Google.{" "}
        {reviews.url && (
          <a
            href={reviews.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-strong underline"
          >
            Ver todas no Google
          </a>
        )}
      </p>
    </section>
  )
}
