import { NoticeIconArt } from "@/components/layout/notice-strip"
import type { SiteStore } from "@/lib/store"
import { trustItems } from "@/lib/trust"

/** Faixa comercial abaixo do cabeçalho; acompanha a rolagem da página. */
export function StoreBanners({ store }: { store: SiteStore }) {
  const items = trustItems(store)
  if (items.length === 0) return null
  return (
    <section aria-label="Conheça a loja e as facilidades de compra" className="bg-shelf">
      <div className="mx-auto max-w-site px-4 py-3">
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex w-52 shrink-0 snap-start flex-col justify-center rounded-md border border-line border-t-2 border-t-brand bg-paper px-4 py-4 lg:flex-1 lg:basis-44"
            >
              <NoticeIconArt name={item.icon} className="mb-3 h-6 w-6 text-brand-strong" />
              <p className="text-sm font-bold leading-snug text-ink">{item.title}</p>
              {item.detail && (
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{item.detail}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
