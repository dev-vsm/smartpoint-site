import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { WhatsAppCta, WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { SectionHeading } from "@/components/ui/section"
import { TrustList } from "@/components/ui/trust-list"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"
import { trustItems } from "@/lib/trust"

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()
  const city = store.city ?? "Uberlândia"
  return {
    alternates: { canonical: "/sobre" },
    title: `A loja — ${store.name} em ${city}`,
    description: `Loja de acessórios para celular${store.district ? ` no ${store.district}` : ""}, em ${city}. Atendimento no balcão e pelo WhatsApp.`,
  }
}

export default async function AboutPage() {
  const [store, submenu] = await Promise.all([getStore(), catalogSubmenu()])

  return (
    <>
      <PageShell submenu={submenu} className="py-8">
        <SectionHeading title="A loja" />
        <div className="max-w-prose space-y-4 text-ink-soft">
          {store.about ? (
            <p className="whitespace-pre-wrap">{store.about}</p>
          ) : (
            <>
              <p>
                A {store.name} é loja de acessórios para celular: escolha na vitrine, tire a dúvida
                no balcão ou pelo WhatsApp e leve na hora.
              </p>
              <p>
                Trabalhamos com capinhas, películas, fones, carregadores e cabos. O que não está na
                vitrine, a gente procura.
              </p>
            </>
          )}
        </div>
        <div className="mt-8">
          <WhatsAppCta
            number={store.whatsapp}
            label="Falar com a loja"
            className="w-auto"
            source="sobre"
          />
        </div>
        <TrustList items={trustItems(store)} variant="bar" className="mt-10" />
      </PageShell>
      <Footer />
      <WhatsAppFloating number={store.whatsapp} />
    </>
  )
}
