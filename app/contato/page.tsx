import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { JsonLd } from "@/components/seo/json-ld"
import { Container, SectionHeading } from "@/components/ui/section"
import { localBusinessJsonLd } from "@/lib/seo"
import { getStore } from "@/lib/store"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Onde estamos",
  alternates: { canonical: "/contato" },
  description:
    "Endereço, horário e contato do quiosque SmartPoint, na Av. João Pinheiro, em Uberlândia.",
}

export default async function ContactPage() {
  const store = await getStore()

  return (
    <>
      <JsonLd data={localBusinessJsonLd(store)} />
      <Header storeName={store.name} logoUrl={store.brand.logoUrl} whatsapp={store.whatsapp} />
      <main className="py-8">
        <Container>
          <SectionHeading
            title="Onde estamos"
            description="Passe no quiosque ou resolva pelo WhatsApp — o que for mais rápido para você."
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
                <WhatsAppCta number={store.whatsapp} className="w-auto" />
                {store.instagram && (
                  <a
                    href={store.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center rounded-sm border border-line bg-paper px-4 text-sm font-semibold hover:border-brand-strong hover:bg-brand-soft"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>

            {store.mapsUrl ? (
              <iframe
                title="Mapa até a loja"
                src={store.mapsUrl}
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
        </Container>
      </main>
      <Footer
        store={{
          name: store.name,
          logoUrl: store.brand.logoUrl,
          addressLine: store.addressLine,
          cityLine: store.cityLine,
          hours: store.hours,
          instagram: store.instagram,
          cnpj: store.cnpj,
        }}
      />
    </>
  )
}
