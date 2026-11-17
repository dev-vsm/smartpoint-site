import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { OrderWatcher } from "@/components/cart/order-watcher"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { ButtonLink } from "@/components/ui/button"
import { getSiteOrder, type SiteOrder } from "@/lib/admin-api"
import { ORDER_ID_PATTERN } from "@/lib/checkout"
import { getStore } from "@/lib/store"
import { cn, formatPrice } from "@/lib/utils"

/** Sempre na hora: o estado do pagamento muda a cada consulta. */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Seu pedido",
  robots: { index: false, follow: false },
}

const HEADLINE: Record<SiteOrder["status"], { title: string; tone: string }> = {
  paid: { title: "Pagamento aprovado!", tone: "bg-brand-soft ring-brand-strong" },
  awaiting_payment: { title: "Aguardando o pagamento", tone: "bg-tag-soft ring-tag" },
  cancelled: { title: "Pedido cancelado", tone: "bg-shelf ring-line" },
}

/**
 * Para onde o Mercado Pago devolve o cliente. O id (20 caracteres aleatórios) é o acesso; o
 * estado vem do admin, que confere o pagamento no MP a cada visita.
 */
export default async function OrderPage({ params }: PageProps<"/pedido/[id]">) {
  const { id } = await params
  if (!ORDER_ID_PATTERN.test(id)) notFound()
  const [result, store] = await Promise.all([getSiteOrder(id), getStore()])
  if (!result.ok && result.status === 404) notFound()

  if (!result.ok) {
    return (
      <>
        <PageShell className="py-8">
          <div className="rounded-md bg-paper p-6 ring-1 ring-line">
            <h1 className="text-2xl">Não conseguimos consultar o pedido agora</h1>
            <p className="mt-2 text-ink-soft">
              Se você já pagou, fique tranquilo: o pagamento fica registrado no Mercado Pago.
              Recarregue a página em instantes ou fale com a loja.
            </p>
            <WhatsAppCta
              number={store.whatsapp}
              message={`Olá! Quero saber do meu pedido ${id.slice(0, 8).toUpperCase()}.`}
              source="pedido"
              className="mt-4"
            />
          </div>
        </PageShell>
        <Footer />
      </>
    )
  }

  const order = result.data
  const headline = HEADLINE[order.status]
  const message = `Olá! Sou ${order.customerFirstName}, do pedido #${order.displayId} feito no site.`
  const pickup = order.fulfillment === "pickup"

  return (
    <>
      <OrderWatcher status={order.status} />
      <PageShell className="py-8">
        <div className={cn("rounded-md p-6 ring-1", headline.tone)}>
          <p className="text-sm text-ink-soft">Pedido #{order.displayId}</p>
          <h1 className="mt-1 text-2xl">{headline.title}</h1>
          <div className="mt-2 max-w-prose text-ink-soft" aria-live="polite">
            {order.status === "paid" && (
              <p>
                Obrigado, {order.customerFirstName}! Já estamos separando.{" "}
                {pickup
                  ? `Avisamos pelo WhatsApp quando estiver pronto para retirar${store.addressLine ? ` em ${store.addressLine}` : " na loja"}.`
                  : "Avisamos pelo WhatsApp quando sair para entrega."}
              </p>
            )}
            {order.status === "awaiting_payment" && (
              <p>
                {order.lastAttemptRejected
                  ? "O último pagamento foi recusado. Você pode tentar de novo com outro cartão ou com Pix."
                  : "Assim que o Mercado Pago confirmar, esta página atualiza sozinha. No Pix, leva só alguns segundos."}
              </p>
            )}
            {order.status === "cancelled" && (
              <p>
                O prazo para pagar terminou e os produtos voltaram para a vitrine. Nada foi cobrado.
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {order.payUrl && (
              <ButtonLink href={order.payUrl}>
                {order.lastAttemptRejected ? "Tentar pagar de novo" : "Pagar agora"}
              </ButtonLink>
            )}
            {order.status === "cancelled" && (
              <Link
                href="/carrinho"
                className="inline-flex min-h-11 items-center font-semibold text-brand-strong underline"
              >
                Voltar ao carrinho
              </Link>
            )}
            <WhatsAppCta
              number={store.whatsapp}
              message={message}
              label="Falar com a loja"
              source="pedido"
            />
          </div>
        </div>

        <section
          aria-labelledby="order-items"
          className="mt-6 rounded-md bg-paper p-5 ring-1 ring-line"
        >
          <h2 id="order-items" className="text-lg">
            Resumo
          </h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {order.items.map((item) => (
              <li key={item.name} className="flex justify-between gap-3 py-2">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="shrink-0 font-semibold">{formatPrice(item.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">
                {pickup ? "Retirada na loja" : `Entrega${order.zone ? ` (${order.zone})` : ""}`}
              </dt>
              <dd>{order.deliveryFee ? formatPrice(order.deliveryFee) : "Grátis"}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>
      </PageShell>
      <Footer />
    </>
  )
}
