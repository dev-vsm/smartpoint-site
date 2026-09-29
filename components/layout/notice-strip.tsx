import type { NoticeIcon, SiteNotice } from "@/lib/site-content"
import { cn } from "@/lib/utils"

/**
 * Faixa de avisos do cabeçalho, no espaço que era do menu: entrega, formas de
 * pagamento, promoção do momento. Texto e ícone vêm do banco (`siteContent/
 * notices`) — nada de promessa escrita no código além do padrão mínimo.
 */
export function NoticeStrip({ notices, className }: { notices: SiteNotice[]; className?: string }) {
  if (notices.length === 0) return null

  return (
    <ul
      aria-label="Avisos da loja"
      className={cn(
        "flex min-w-0 items-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {notices.map((notice) => {
        const promo = notice.tone === "promo"
        const content = (
          <>
            {notice.icon && <NoticeIconArt name={notice.icon} />}
            {notice.text}
          </>
        )
        const style = cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1 text-xs font-semibold",
          promo ? "bg-tag-soft text-tag-strong" : "text-brand-strong",
        )

        return (
          <li key={notice.text} className="shrink-0">
            {notice.href ? (
              <a href={notice.href} className={cn(style, "hover:underline")}>
                {content}
              </a>
            ) : (
              <span className={style}>{content}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Traço simples, 1.5px, para pesar o mínimo no HTML de toda página. */
function NoticeIconArt({ name }: { name: NoticeIcon }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      {PATHS[name]}
    </svg>
  )
}

const PATHS: Record<NoticeIcon, React.ReactNode> = {
  entrega: (
    <>
      <path d="M2 5.5h9v8H2z" />
      <path d="M11 8h3l3 3v2.5h-6z" />
      <circle cx="6" cy="15" r="1.5" />
      <circle cx="14" cy="15" r="1.5" />
    </>
  ),
  cartao: (
    <>
      <rect x="2" y="5" width="16" height="10" rx="1.5" />
      <path d="M2 8.5h16M5 12h3" />
    </>
  ),
  pix: (
    <>
      <path d="M7 3.5 3.5 7 7 10.5M13 9.5l3.5 3.5L13 16.5" />
      <path d="M10 6v8" />
    </>
  ),
  loja: (
    <>
      <path d="M3 8V6l2-2.5h10L17 6v2a2 2 0 0 1-3.5 1.3A2 2 0 0 1 10 9.5a2 2 0 0 1-3.5-.2A2 2 0 0 1 3 8Z" />
      <path d="M4.5 10v6.5h11V10" />
    </>
  ),
  relogio: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.5l3 1.5" />
    </>
  ),
}
