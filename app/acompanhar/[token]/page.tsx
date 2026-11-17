import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { getOrderTracking, TRACKING_TOKEN_PATTERN } from "@/lib/admin-api"
import { getStore } from "@/lib/store"
import { cn, formatPrice } from "@/lib/utils"

/** Sempre na hora: a loja marca as etapas a qualquer momento. */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Acompanhar pedido",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

function when(ms: number) {
  return new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  })
}

/**
 * Acompanhamento do pedido pelo link que a loja manda ao cliente. O token (id aleatório +
 * assinatura do admin) é o acesso: sem login, sem id do pedido, sem endereço nem contato na
 * página. Token inválido, adulterado ou de pedido inexistente = 404, sempre igual.
 */
export default async function TrackingPage({ params }: PageProps<"/acompanhar/[token]">) {
  const { token } = await params
  if (!TRACKING_TOKEN_PATTERN.test(token)) notFound()
  const [result, store] = await Promise.all([getOrderTracking(token), getStore()])
  if (!result.ok && result.status === 404) notFound()

  if (!result.ok) {
    return (
      <>
        <PageShell className="py-8">
          <div className="rounded-md bg-paper p-6 ring-1 ring-line">
            <h1 className="text-2xl">Não conseguimos consultar o pedido agora</h1>
            <p className="mt-2 text-ink-soft">
              Recarregue a página em instantes ou fale com a loja.
            </p>
            <WhatsAppCta
              number={store.whatsapp}
              message="Olá! Quero saber do meu pedido feito no site."
              source="acompanhar"
              className="mt-4"
            />
          </div>
        </PageShell>
        <Footer />
      </>
    )
  }

  const tracking = result.data
  const current = tracking.steps.find((step) => step.current)
  return (
    <>
      <PageShell className="py-8">
        <div className="rounded-md bg-paper p-6 ring-1 ring-line">
          <p className="text-sm text-ink-soft">Pedido #{tracking.displayId}</p>
          <h1 className="mt-1 text-2xl">
            {tracking.cancelled
              ? "Pedido cancelado"
              : `${tracking.customerFirstName ? `${tracking.customerFirstName}, s` : "S"}eu pedido: ${(current?.label ?? "Pedido criado").toLowerCase()}`}
          </h1>

          <ol aria-label="Etapas do pedido" className="mt-6">
            {tracking.steps.map((step, index) => (
              <li
                key={step.stage}
                aria-current={step.current ? "step" : undefined}
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                {index < tracking.steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-7 left-[13px] h-[calc(100%-1.5rem)] w-0.5",
                      step.done && tracking.steps[index + 1]?.done ? "bg-brand-strong" : "bg-line",
                    )}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2",
                    step.done
                      ? "bg-brand text-brand-ink ring-brand-strong"
                      : "bg-paper text-ink-soft ring-line",
                    step.current && "ring-4",
                  )}
                >
                  {step.done ? "✓" : index + 1}
                </span>
                <div className="pt-0.5">
                  <p className={cn(step.done ? "font-semibold" : "text-ink-soft")}>
                    {step.label}
                    <span className="sr-only">{step.done ? " (concluída)" : " (a seguir)"}</span>
                  </p>
                  {step.at !== undefined && (
                    <p className="text-sm text-ink-soft tabular-nums">{when(step.at)}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <WhatsAppCta
            number={store.whatsapp}
            message={`Olá! Sou ${tracking.customerFirstName}, do pedido #${tracking.displayId} feito no site.`}
            label="Falar com a loja"
            source="acompanhar"
            className="mt-6"
          />
        </div>

        <section
          aria-labelledby="tracking-items"
          className="mt-6 rounded-md bg-paper p-5 ring-1 ring-line"
        >
          <h2 id="tracking-items" className="text-lg">
            {tracking.fulfillment === "pickup" ? "Retirada na loja" : "Entrega"}
          </h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {tracking.items.map((item) => (
              <li key={item.name} className="py-2">
                {item.quantity}x {item.name}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-line pt-3 font-bold">
            <span>Total</span>
            <span>{formatPrice(tracking.total)}</span>
          </p>
        </section>
      </PageShell>
      <Footer />
    </>
  )
}
