import Link from "next/link"
import { NoticeIconArt } from "@/components/layout/notice-strip"
import { purchaseHighlights } from "@/lib/purchase-highlights"
import type { SiteStore } from "@/lib/store"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

/** Uma faixa editorial: condição em destaque, contexto legível e ação específica. */
export function StoreBanners({ store }: { store: SiteStore }) {
  const items = purchaseHighlights(store)
  if (items.length === 0) return null
  return (
    <section aria-label="Condições e facilidades da loja" className="min-w-0">
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] lg:grid lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))] lg:overflow-visible">
        {items.map((item, index) => {
          const content = (
            <>
              <span className="flex items-center justify-between gap-3 text-brand-strong">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  {item.label}
                </span>
                <NoticeIconArt name={item.icon} className="h-5 w-5 shrink-0" />
              </span>
              <span className="mt-1 block text-lg font-bold leading-tight text-ink xl:text-xl">
                {item.title}
              </span>
              <span className="mt-1 block text-xs leading-snug text-ink-soft">{item.detail}</span>
              <span className="mt-auto flex items-center gap-2 pt-2 text-xs font-semibold text-brand-strong group-hover:underline">
                {item.action} <span aria-hidden="true">↗</span>
              </span>
            </>
          )
          const className = `group flex h-full flex-col border-l-2 px-4 py-3 transition-colors hover:bg-brand-soft focus-visible:-outline-offset-2 ${index === 0 ? "border-tag bg-tag-soft/70" : "border-brand bg-brand-soft/50"}`
          return (
            <li key={item.id} className="w-[min(82vw,22rem)] shrink-0 snap-start lg:w-auto">
              {item.id === "loja" ? (
                <Link href="/contato" className={className}>
                  {content}
                </Link>
              ) : (
                <a
                  href={buildWhatsAppUrl(
                    store.whatsapp,
                    `Olá! Gostaria de saber mais sobre: ${item.title}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-wa-source={`beneficio_${item.id}`}
                  className={className}
                >
                  {content}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
