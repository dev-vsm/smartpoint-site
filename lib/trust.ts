import type { NoticeIcon, SiteNotice } from "@/lib/site-content"
import type { SiteStore, StorePayment } from "@/lib/store-rules"

/**
 * Respostas curtas para o que trava a compra: onde retiro, entregam, como pago,
 * tem garantia. Tudo sai de `settings/store` — o que a loja não cadastrou não
 * vira promessa no site.
 */
export interface TrustItem {
  icon: NoticeIcon
  title: string
  detail?: string
}

/** O link de pagamento online que a loja envia pelo WhatsApp. */
export const PAYMENT_LINK_PROVIDER = "Mercado Pago"

/** "em até 12x" / "em até 6x sem juros" — `undefined` quando é só à vista. */
export function installmentsText(payment: StorePayment): string | undefined {
  if (!payment.methods.includes("credit") || payment.maxInstallments < 2) return undefined
  if (payment.interestFreeInstallments >= 2) {
    const extra =
      payment.maxInstallments > payment.interestFreeInstallments
        ? ` (até ${payment.maxInstallments}x no total)`
        : ""
    return `em até ${payment.interestFreeInstallments}x sem juros${extra}`
  }
  return `em até ${payment.maxInstallments}x`
}

function cardItem(payment: StorePayment): TrustItem | undefined {
  const credit = payment.methods.includes("credit")
  const debit = payment.methods.includes("debit")
  if (!credit && !debit) return undefined
  const installments = installmentsText(payment)
  const detail = [
    credit && `Crédito${installments ? ` ${installments}` : ""}`,
    debit && (credit ? "débito" : "Débito"),
  ]
    .filter(Boolean)
    .join(" e ")
  return { icon: "cartao", title: "Aceitamos cartões", detail }
}

export function trustItems(
  store: SiteStore,
  { warranty }: { warranty?: string } = {},
): TrustItem[] {
  const { payment } = store
  const place = [store.district, store.city].filter(Boolean).join(", ")
  const pix = payment.methods.includes("pix_maquina") || payment.methods.includes("pix_chave")
  const guarantee = warranty ?? store.warranty

  const items: Array<TrustItem | false | undefined> = [
    place.length > 0 && { icon: "loja", title: "Retire na loja", detail: place },
    !!store.city && {
      icon: "entrega",
      title: `Entrega em toda ${store.city}`,
      detail: "Combine o horário pelo WhatsApp",
    },
    cardItem(payment),
    pix && { icon: "pix", title: "Pix", detail: "Aprovação na hora" },
    payment.methods.includes("payment_link") && {
      icon: "online",
      title: "Pagamento online",
      detail: `Link do ${PAYMENT_LINK_PROVIDER}`,
    },
    !!guarantee && { icon: "garantia", title: "Garantia", detail: guarantee },
  ]
  return items.filter((item): item is TrustItem => Boolean(item))
}

/**
 * Avisos do cabeçalho quando o admin ainda não cadastrou `siteContent/notices`:
 * as mesmas garantias, em uma linha cada.
 */
export function defaultNotices(store: SiteStore): SiteNotice[] {
  const installments = installmentsText(store.payment)
  const card = store.payment.methods.some((method) => method === "credit" || method === "debit")
  const notices: Array<SiteNotice | false | undefined> = [
    !!store.city && { text: `Entrega em toda ${store.city}`, icon: "entrega" },
    card && {
      text: installments ? `Aceitamos cartões ${installments}` : "Aceitamos cartões",
      icon: "cartao",
    },
    store.payment.methods.includes("payment_link") && {
      text: `Pagamento online pelo ${PAYMENT_LINK_PROVIDER}`,
      icon: "online",
    },
  ]
  return notices.filter((notice): notice is SiteNotice => Boolean(notice))
}
