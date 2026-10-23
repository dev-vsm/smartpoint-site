import type { NoticeIcon, SiteNotice } from "@/lib/site-content"
import { cn } from "@/lib/utils"

/**
 * Avisos no topo de toda página: entrega, formas de pagamento, promoção do
 * momento. Cada aviso é um cartão próprio, em cor cheia e com sombra, solto
 * sobre o fundo — é a primeira coisa que o olho pega. Texto e ícone vêm do banco (`siteContent/notices`, ou os padrões
 * de `settings/store`) — nada de promessa escrita no código.
 *
 * No desktop os avisos ficam lado a lado; no celular e no tablet, onde não cabem, passam
 * rolando sozinhos (só CSS). Quem prefere menos movimento recebe a lista parada,
 * com rolagem lateral.
 */
export function NoticeStrip({ notices, className }: { notices: SiteNotice[]; className?: string }) {
  if (notices.length === 0) return null

  return (
    <div className={cn("bg-shelf", className)}>
      <ul
        aria-label="Avisos da loja"
        className="mx-auto hidden max-w-site flex-wrap items-center justify-center gap-3 px-4 pt-3 pb-2 lg:flex"
      >
        {notices.map((notice) => (
          <li key={notice.text}>
            <NoticeItem notice={notice} />
          </li>
        ))}
      </ul>

      {notices.length === 1 ? (
        <div className="flex justify-center px-4 pt-3 pb-2 lg:hidden">
          <NoticeItem notice={notices[0]} />
        </div>
      ) : (
        <div className="overflow-hidden lg:hidden motion-reduce:overflow-x-auto">
          <div
            className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
            style={{ "--marquee-duration": `${notices.length * 6}s` } as React.CSSProperties}
          >
            {/* Duas cópias em fila: quando a primeira sai, a segunda está no lugar dela. */}
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-label={copy === 0 ? "Avisos da loja" : undefined}
                aria-hidden={copy === 1 || undefined}
                className="flex shrink-0 items-center gap-3 pt-3 pr-3 pb-2 pl-4"
              >
                {notices.map((notice) => (
                  <li key={notice.text}>
                    <NoticeItem notice={notice} hidden={copy === 1} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NoticeItem({ notice, hidden = false }: { notice: SiteNotice; hidden?: boolean }) {
  const promo = notice.tone === "promo"
  const content = (
    <>
      {notice.icon && <NoticeIconArt name={notice.icon} className="text-brand-soft" />}
      {notice.text}
    </>
  )
  const style = cn(
    "inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-semibold",
    "shadow-md ring-1 transition-transform",
    promo
      ? "bg-tag text-tag-ink shadow-tag/30 ring-tag-strong/20 [&_svg]:text-tag-ink"
      : "bg-brand-deep text-paper shadow-brand-deep/30 ring-paper/10",
  )

  return notice.href ? (
    <a
      href={notice.href}
      tabIndex={hidden ? -1 : undefined}
      className={cn(style, "underline-offset-2 hover:-translate-y-0.5 hover:underline")}
    >
      {content}
    </a>
  ) : (
    <span className={style}>{content}</span>
  )
}

/** Traço simples, 1.5px, para pesar o mínimo no HTML de toda página. */
export function NoticeIconArt({ name, className }: { name: NoticeIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-4 w-4 shrink-0", className)}
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
  online: (
    <>
      <rect x="5.5" y="2.5" width="9" height="15" rx="1.5" />
      <path d="M8.5 7.5h3M10 7.5v5M8.5 11l1.5 1.5 1.5-1.5" />
    </>
  ),
  garantia: (
    <>
      <path d="M10 2.5 4 4.5v5c0 3.6 2.6 6.4 6 8 3.4-1.6 6-4.4 6-8v-5z" />
      <path d="m7.5 10 2 2 3-3.5" />
    </>
  ),
}
