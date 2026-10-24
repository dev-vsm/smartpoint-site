import { NoticeIconArt } from "@/components/layout/notice-strip"
import { type PurchaseHighlight, purchaseHighlights } from "@/lib/purchase-highlights"
import type { SiteNotice } from "@/lib/site-content"
import type { SiteStore } from "@/lib/store"
import { cn } from "@/lib/utils"

/**
 * Mini cards acima da busca, no padrão "barra de benefícios" do varejo: ícone,
 * promessa em negrito e um detalhe. São só informação, não botões: a
 * conversão fica com os CTAs do WhatsApp. A oferta vem primeiro, em laranja e
 * um pouco mais larga; as condições da loja vêm depois, em branco. Só CSS: no
 * celular a fila rola de lado e o próximo card aparece pela metade.
 */
export function StoreBanners({ store, notices }: { store: SiteStore; notices?: SiteNotice[] }) {
  const items = purchaseHighlights(store, notices)
  if (items.length === 0) return null

  return (
    <section aria-label="Vantagens de comprar na loja" className="min-w-0">
      <ul className="-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:-mx-4 sm:scroll-px-4 sm:px-4 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex shrink-0 snap-start",
              item.tone === "promo"
                ? "w-[min(84vw,20rem)] lg:w-auto lg:flex-[1.35]"
                : "w-[min(70vw,16rem)] lg:w-auto lg:flex-1",
            )}
          >
            <HighlightCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function HighlightCard({ item }: { item: PurchaseHighlight }) {
  const promo = item.tone === "promo"

  return (
    <div
      className={cn(
        "relative flex w-full min-h-15 items-center gap-3 overflow-hidden rounded-md px-3 py-2",
        promo
          ? "bg-tag text-tag-ink shadow-md shadow-tag/30"
          : "bg-paper text-ink ring-1 ring-line",
      )}
    >
      {promo && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-paper/25 animate-shine motion-reduce:hidden"
        />
      )}
      <span
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-sm",
          promo ? "bg-paper/30 text-tag-ink" : "bg-brand-soft text-brand-strong",
        )}
      >
        <NoticeIconArt name={item.icon} className="h-5 w-5" />
      </span>
      <p className="relative min-w-0 flex-1">
        {promo && (
          <span className="mb-0.5 inline-block rounded-sm bg-tag-ink px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-tag-soft">
            Oferta
          </span>
        )}
        <strong className="display line-clamp-2 block text-sm leading-tight">{item.title}</strong>
        {item.detail && (
          <span
            className={cn(
              "mt-0.5 block truncate text-xs",
              promo ? "text-tag-ink/90" : "text-ink-soft",
            )}
          >
            {item.detail}
          </span>
        )}
      </p>
    </div>
  )
}
