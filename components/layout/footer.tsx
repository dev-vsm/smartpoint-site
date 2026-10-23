import Link from "next/link"
import { Brand } from "@/components/layout/brand"
import { getStore } from "@/lib/store"
import { formatPhone } from "@/lib/utils"
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp"

/** Rotas do site — navegação, não dado da loja. O cabeçalho é só marca e busca. */
const PAGES = [
  { href: "/sobre", label: "A loja" },
  { href: "/contato", label: "Onde estamos" },
]

/** "https://www.instagram.com/udiasmartpoint/" → "@udiasmartpoint". */
function socialHandle(url: string): string {
  const handle = url
    .replace(/[?#].*$/, "")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/^@/, "")
  return handle && !handle.includes(".") ? `@${handle}` : url
}

const linkStyle = "font-semibold text-brand-strong hover:underline"

/**
 * Rodapé com o que o cliente procura antes de sair: onde fica, quando abre e
 * como falar. Busca a loja sozinho — todo dado aqui vem de `settings/store`, e
 * o que não está cadastrado não aparece (coluna inteira some, se for o caso).
 */
export async function Footer() {
  const store = await getStore()

  // Telefone igual ao WhatsApp não precisa aparecer duas vezes.
  const phone =
    store.phone && normalizeWhatsAppNumber(store.phone) !== normalizeWhatsAppNumber(store.whatsapp)
      ? store.phone
      : undefined
  const contacts = [
    {
      label: "WhatsApp",
      text: formatPhone(store.whatsapp),
      href: buildWhatsAppUrl(store.whatsapp),
      external: true,
    },
    phone && {
      label: "Telefone",
      text: formatPhone(phone),
      href: `tel:+${normalizeWhatsAppNumber(phone)}`,
      external: false,
    },
    store.email && {
      label: "E-mail",
      text: store.email,
      href: `mailto:${store.email}`,
      external: false,
    },
    ...store.social.map((link) => ({
      label: link.label,
      text: socialHandle(link.url),
      href: link.url,
      external: true,
    })),
  ].filter((contact) => !!contact)

  const hasAddress = Boolean(store.addressLine || store.cityLine)

  return (
    <footer className="mt-16 border-t border-line bg-brand-soft/50">
      {/* Colunas automáticas: sem endereço ou sem horário, as outras dividem o espaço. */}
      <div className="mx-auto grid max-w-site gap-x-6 gap-y-8 px-4 py-10 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
        <div>
          <Brand name={store.name} logoUrl={store.brand.logoUrl} />
          {store.about && <p className="mt-3 line-clamp-4 text-sm text-ink-soft">{store.about}</p>}
          <nav aria-label="Páginas do site" className="mt-4">
            <ul className="space-y-1 text-sm">
              {PAGES.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className={linkStyle}>
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {(hasAddress || store.map) && (
          <div>
            <h2 className="text-sm">Onde estamos</h2>
            {store.map && (
              // Abaixo da dobra em toda página: `lazy` segura o iframe até o cliente rolar.
              <iframe
                title={`Mapa: ${store.name}${store.addressLine ? ` em ${store.addressLine}` : ""}`}
                src={store.map.embedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-2 h-36 w-full max-w-xs rounded-md ring-1 ring-line"
              />
            )}
            {hasAddress && (
              <address className="mt-2 text-sm not-italic text-ink-soft">
                <AddressLink map={store.map}>
                  {store.addressLine}
                  {store.addressLine && store.cityLine && <br />}
                  {store.cityLine}
                  {store.postalCode && (
                    <>
                      <br />
                      CEP {store.postalCode}
                    </>
                  )}
                </AddressLink>
              </address>
            )}
          </div>
        )}

        <div>
          <h2 className="text-sm">Contato</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {contacts.map((contact) => (
              <li key={contact.label}>
                <span className="text-ink-soft">{contact.label}: </span>
                <a
                  href={contact.href}
                  {...(contact.external && { target: "_blank", rel: "noopener noreferrer" })}
                  {...(contact.label === "WhatsApp" && { "data-wa-source": "rodape" })}
                  className={linkStyle}
                >
                  {contact.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {store.hours.length > 0 && (
          <div>
            <h2 className="text-sm">Horário</h2>
            <dl className="mt-2 space-y-1 text-sm text-ink-soft">
              {store.hours.map((slot) => (
                <div key={slot.days} className="flex justify-between gap-3">
                  <dt>{slot.days}</dt>
                  <dd className="tabular-nums">
                    {slot.opens} às {slot.closes}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-ink-soft">
          <p>
            {store.legalName ?? store.name}
            {store.cnpj && ` · CNPJ ${store.cnpj}`}
          </p>
          <Link href="/privacidade" className="hover:underline">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}

/** O próprio endereço abre o Google Maps — no celular, já no app, para traçar a rota. */
function AddressLink({ map, children }: { map?: { linkUrl: string }; children: React.ReactNode }) {
  if (!map) return children
  return (
    <a
      href={map.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-line underline-offset-2 hover:text-brand-strong hover:decoration-brand-strong"
    >
      {children}
      <span className="sr-only"> (abrir no Google Maps)</span>
    </a>
  )
}
