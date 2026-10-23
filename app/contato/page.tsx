import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { JsonLd } from "@/components/seo/json-ld"
import { SectionHeading } from "@/components/ui/section"
import { localBusinessJsonLd } from "@/lib/seo"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()
  const place = [store.addressLine, store.cityLine].filter(Boolean).join(", ")
  return {
    title: "Onde estamos",
    alternates: { canonical: "/contato" },
    description: `Endereço, horário e contato da ${store.name}${place ? `: ${place}` : ""}.`,
  }
}

export default async function ContactPage() {
  const [store, submenu] = await Promise.all([getStore(), catalogSubmenu()])

  return (
    <>
      <JsonLd data={localBusinessJsonLd(store)} />
      <PageShell submenu={submenu} className="py-8">
        <SectionHeading
          title="Onde estamos"
          description="Passe na loja ou resolva pelo WhatsApp — o que for mais rápido para você."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-md bg-paper p-5 ring-1 ring-line">
            <h2 className="text-lg">Endereço</h2>
            {store.addressLine ? (
              <address className="mt-2 not-italic text-ink-soft">
                {store.addressLine}
                <br />
                {store.cityLine}
                {store.postalCode && (
                  <>
                    <br />
                    CEP {store.postalCode}
                  </>
                )}
              </address>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                Confirme o endereço com a gente pelo WhatsApp.
              </p>
            )}

            <h2 className="mt-6 text-lg">Horário</h2>
            {store.hours.length ? (
              <dl className="mt-2 space-y-1 text-sm text-ink-soft">
                {store.hours.map((slot) => (
                  <div key={slot.days} className="flex max-w-xs justify-between gap-3">
                    <dt>{slot.days}</dt>
                    <dd className="tabular-nums">
                      {slot.opens} às {slot.closes}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">Pergunte o horário pelo WhatsApp.</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <WhatsAppCta number={store.whatsapp} className="w-auto" source="contato" />
              {store.social.map((link) => (
                <a
                  key={link.network}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-sm border border-line bg-paper px-4 text-sm font-semibold hover:border-brand-strong hover:bg-brand-soft"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {store.map ? (
            <iframe
              title="Mapa até a loja"
              src={store.map.embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full rounded-md ring-1 ring-line lg:h-full"
            />
          ) : (
            <div className="flex h-60 items-center justify-center rounded-md bg-paper p-6 text-center text-sm text-ink-soft ring-1 ring-line">
              O mapa aparece aqui assim que o endereço for cadastrado no admin.
            </div>
          )}
        </div>
      </PageShell>
      <Footer />
    </>
  )
}
