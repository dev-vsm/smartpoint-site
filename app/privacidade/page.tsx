import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { SectionHeading } from "@/components/ui/section"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"

export const revalidate = 86400

export const metadata: Metadata = {
  alternates: { canonical: "/privacidade" },
  title: "Privacidade",
  description: "Como a SmartPoint trata os dados de quem usa o site.",
}

export default async function PrivacyPage() {
  const [store, submenu] = await Promise.all([getStore(), catalogSubmenu()])

  return (
    <>
      <PageShell submenu={submenu} className="py-8">
        <SectionHeading title="Privacidade" />
        <div className="max-w-prose space-y-4 text-sm text-ink-soft">
          <p>
            Este site não cria conta, não usa cookie de rastreamento e não guarda o que você digita.
            O formulário de orçamento monta uma mensagem e abre o WhatsApp no seu aparelho — nada é
            enviado nem armazenado por aqui.
          </p>
          <p>
            A partir do momento em que você inicia a conversa, valem os termos do WhatsApp e as
            informações que você escolher enviar ficam nessa conversa, usadas apenas para atender o
            seu pedido.
          </p>
          <p>
            Medimos audiência com o Vercel Analytics, que conta visitas e desempenho das páginas de
            forma agregada, sem cookie e sem identificar quem visitou.
          </p>
          <p>
            Para pedir informação ou remoção de algum dado que você tenha nos enviado, fale com a
            gente pelo WhatsApp{store.cnpj ? ` (${store.name}, CNPJ ${store.cnpj})` : ""}.
          </p>
        </div>
      </PageShell>
      <Footer />
    </>
  )
}
