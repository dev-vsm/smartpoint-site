import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Container, SectionHeading } from "@/components/ui/section"
import { listNotices } from "@/lib/site-content"
import { getStore } from "@/lib/store"

export const revalidate = 86400

export const metadata: Metadata = {
  alternates: { canonical: "/privacidade" },
  title: "Privacidade",
  description: "Como a SmartPoint trata os dados de quem usa o site.",
}

export default async function PrivacyPage() {
  const [store, notices] = await Promise.all([getStore(), listNotices()])

  return (
    <>
      <Header
        storeName={store.name}
        logoUrl={store.brand.logoUrl}
        whatsapp={store.whatsapp}
        notices={notices}
      />
      <main className="py-8">
        <Container>
          <SectionHeading title="Privacidade" />
          <div className="max-w-prose space-y-4 text-sm text-ink-soft">
            <p>
              Este site não cria conta, não usa cookie de rastreamento e não guarda o que você
              digita. O formulário de orçamento monta uma mensagem e abre o WhatsApp no seu aparelho
              — nada é enviado nem armazenado por aqui.
            </p>
            <p>
              A partir do momento em que você inicia a conversa, valem os termos do WhatsApp e as
              informações que você escolher enviar ficam nessa conversa, usadas apenas para atender
              o seu pedido.
            </p>
            <p>
              Medimos audiência com o Vercel Analytics, que conta visitas e desempenho das páginas
              de forma agregada, sem cookie e sem identificar quem visitou.
            </p>
            <p>
              Para pedir informação ou remoção de algum dado que você tenha nos enviado, fale com a
              gente pelo WhatsApp{store.cnpj ? ` (${store.name}, CNPJ ${store.cnpj})` : ""}.
            </p>
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
