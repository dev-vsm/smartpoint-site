import type { SiteStore } from "@/lib/store"

/** Convite para o Instagram — de onde vem a maior parte de quem chega ao site. */
export function InstagramBand({ store }: { store: SiteStore }) {
  const instagram = store.social.find((link) => link.network === "instagram")
  if (!instagram) return null
  const handle = instagram.url
    .replace(/[?#].*$/, "")
    .split("/")
    .filter(Boolean)
    .pop()

  return (
    <section className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-md bg-brand-soft p-6 ring-1 ring-line">
      <div>
        <h2 className="text-xl">Novidades toda semana no Instagram</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Lançamentos, ofertas e o que acabou de chegar na loja.
        </p>
      </div>
      <a
        href={instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center rounded-sm bg-brand px-4 text-sm font-semibold text-brand-ink hover:bg-brand-strong hover:text-paper"
      >
        Seguir {handle ? `@${handle.replace(/^@/, "")}` : "no Instagram"}
      </a>
    </section>
  )
}
