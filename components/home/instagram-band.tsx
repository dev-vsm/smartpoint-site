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
    <a
      href={instagram.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver novidades ${handle ? `de @${handle.replace(/^@/, "")}` : "da loja"} no Instagram`}
      title="Novidades e ofertas no Instagram"
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-sm border border-tag/30 bg-tag-soft px-2 text-tag-strong transition-colors hover:border-tag-strong hover:bg-paper lg:px-3"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-tag-strong"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
      <span className="hidden text-xs font-semibold lg:inline">Instagram</span>
    </a>
  )
}
