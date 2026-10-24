import type { NoticeIcon, SiteNotice } from "@/lib/site-content"
import type { SiteStore } from "@/lib/store-rules"
import { PAYMENT_LINK_PROVIDER } from "@/lib/trust"

/**
 * Mini card do topo: uma promessa curta que destrava a compra (oferta, parcela,
 * entrega, retirada, garantia). É informação, não botão: a conversão fica com os
 * CTAs do WhatsApp.
 */
export interface PurchaseHighlight {
  id: string
  icon: NoticeIcon
  title: string
  detail?: string
  /** `promo` vira o card laranja de oferta, sempre o primeiro. */
  tone: "promo" | "info"
}

/** Mais que isso vira ruído: o olho lê três ou quatro promessas e decide. */
export const MAX_HIGHLIGHTS = 4

function list(words: string[]): string {
  return words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} e ${words.at(-1)}`
}

/** Parcela no título (o que mais pesa) e as outras formas no detalhe. */
function paymentHighlight(store: SiteStore): PurchaseHighlight | undefined {
  const { methods, maxInstallments, interestFreeInstallments } = store.payment
  const credit = methods.includes("credit")
  const pix = methods.includes("pix_maquina") || methods.includes("pix_chave")
  const others = [
    pix && "Pix",
    methods.includes("debit") && "débito",
    methods.includes("cash") && "dinheiro",
  ].filter((word): word is string => Boolean(word))

  let title: string
  const extra: string[] = []
  if (credit && interestFreeInstallments >= 2) {
    title = `Até ${interestFreeInstallments}x sem juros`
    if (maxInstallments > interestFreeInstallments) extra.push(`ou até ${maxInstallments}x`)
  } else if (credit && maxInstallments >= 2) {
    title = `Até ${maxInstallments}x no cartão`
  } else if (credit) {
    title = "Aceitamos cartão"
  } else if (pix) {
    title = "Pague no Pix"
    others.shift()
  } else if (others.length > 0) {
    title = "Pague como preferir"
  } else {
    return undefined
  }
  if (others.length > 0) extra.push(list(others))

  return {
    id: "pagamento",
    icon: credit ? "cartao" : "pix",
    title,
    detail: extra.length > 0 ? extra.join(" · ") : undefined,
    tone: "info",
  }
}

/**
 * Oferta primeiro (avisos `promo` de `siteContent/notices`, editados no admin),
 * depois as condições reais de `settings/store`. Nada é prometido aqui: o que
 * não está cadastrado não vira card.
 */
export function purchaseHighlights(
  store: SiteStore,
  notices: SiteNotice[] = [],
): PurchaseHighlight[] {
  const promos: PurchaseHighlight[] = notices
    .filter((notice) => notice.tone === "promo")
    .map((notice, index) => ({
      id: `oferta-${index + 1}`,
      icon: notice.icon ?? "oferta",
      title: notice.text,
      detail: notice.detail,
      tone: "promo",
    }))
  // Se a oferta já fala de entrega, o card padrão de entrega repetiria a mesma coisa.
  const promoCoversDelivery = promos.some((promo) => promo.icon === "entrega")
  const { methods } = store.payment
  const place = [store.district, store.city].filter(Boolean).join(" · ") || store.addressLine

  const items: Array<PurchaseHighlight | false | undefined> = [
    ...promos,
    paymentHighlight(store),
    !!store.city &&
      !promoCoversDelivery && {
        id: "entrega",
        icon: "entrega",
        title: `Entrega em toda ${store.city}`,
        detail: "Combine o horário pelo WhatsApp",
        tone: "info",
      },
    !!place && {
      id: "loja",
      icon: "loja",
      title: "Retire na loja",
      detail: place,
      tone: "info",
    },
    methods.includes("payment_link") && {
      id: "online",
      icon: "online",
      title: "Compre sem sair de casa",
      detail: `Link de pagamento ${PAYMENT_LINK_PROVIDER}`,
      tone: "info",
    },
    !!store.warranty && {
      id: "garantia",
      icon: "garantia",
      title: "Compra com garantia",
      detail: store.warranty,
      tone: "info",
    },
  ]
  return items.filter((item): item is PurchaseHighlight => Boolean(item)).slice(0, MAX_HIGHLIGHTS)
}
