import type { Testimonial } from "@/lib/home-content"

/** Depoimentos cadastrados no admin (`siteContent/home.testimonials`). */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null

  return (
    <section aria-labelledby="depoimentos" className="mt-14">
      <h2 id="depoimentos" className="mb-5 text-2xl">
        Quem comprou, recomenda
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={`${item.name}-${item.text.slice(0, 20)}`}>
            <figure className="h-full rounded-md bg-paper p-5 ring-1 ring-line">
              {item.rating && (
                <p className="text-tag" role="img" aria-label={`Nota ${item.rating} de 5`}>
                  {"★".repeat(item.rating)}
                  <span className="text-line">{"★".repeat(5 - item.rating)}</span>
                </p>
              )}
              <blockquote className="mt-2 text-sm text-ink">“{item.text}”</blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-ink-soft">
                {item.name}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
