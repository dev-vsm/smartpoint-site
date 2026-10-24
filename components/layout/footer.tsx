import Image from "next/image"
import Link from "next/link"
import { Brand } from "@/components/layout/brand"
import { OpenNow } from "@/components/layout/open-now"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { EmailButton, PhoneButton } from "@/components/ui/contact-buttons"
import { SocialButton } from "@/components/ui/social-button"
import { getStore } from "@/lib/store"
import { formatPhone } from "@/lib/utils"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"

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
            <h2 className="text-sm">Venha conhecer a loja</h2>
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
            {store.map && (
              <a
                href={store.map.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand-strong hover:underline"
              >
                Como chegar →
              </a>
            )}
          </div>
        )}

        <div>
          <h2 className="text-sm">Contato</h2>
          {/* Cada contato com a cara de onde leva: WhatsApp verde, Gmail, Instagram… */}
          <ul className="mt-2 flex max-w-xs flex-col gap-2">
            <li>
              <WhatsAppCta
                number={store.whatsapp}
                label={formatPhone(store.whatsapp)}
                ariaLabel={`Falar no WhatsApp: ${formatPhone(store.whatsapp)}`}
                source="rodape"
                className="w-full! justify-start px-3 text-xs sm:px-4 sm:text-sm"
              />
            </li>
            {phone && (
              <li>
                <PhoneButton
                  label={formatPhone(phone)}
                  href={`tel:+${normalizeWhatsAppNumber(phone)}`}
                  className="w-full"
                />
              </li>
            )}
            {store.email && (
              <li>
                <EmailButton email={store.email} className="w-full" />
              </li>
            )}
            {store.social.map((link) => (
              <li key={link.network}>
                <SocialButton link={link} text={socialHandle(link.url)} className="w-full" />
              </li>
            ))}
          </ul>
        </div>

        {store.hours.length > 0 && (
          <div>
            <h2 className="text-sm">Horário</h2>
            <OpenNow hours={store.hours} className="mt-2" />
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

      {store.photos.length > 0 && (
        <div className="mx-auto max-w-site px-4 pb-8">
          <h2 className="mb-3 text-sm">Conheça nosso espaço</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {store.photos.slice(0, 4).map((photo, index) => (
              <li key={photo.url} className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Image
                  src={photo.url}
                  alt={photo.alt ?? `Foto ${index + 1} da loja ${store.name}`}
                  fill
                  sizes="(min-width: 1536px) 368px, (min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

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
