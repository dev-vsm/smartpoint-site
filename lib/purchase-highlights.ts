import type { NoticeIcon } from "@/lib/site-content"
import type { SiteStore } from "@/lib/store-rules"
import { installmentsText } from "@/lib/trust"
import { formatPrice } from "@/lib/utils"

export interface PurchaseHighlight {
  id: string
  label: string
  title: string
  detail: string
  action: string
  icon: NoticeIcon
}

/** Condições reais do cadastro, agrupadas por decisão de compra. */
export function purchaseHighlights(store: SiteStore): PurchaseHighlight[] {
  const items: PurchaseHighlight[] = []
  const { payment } = store
  const methods = payment.methods
  const installments = installmentsText(payment)
  const otherMethods = [
    (methods.includes("pix_chave") || methods.includes("pix_maquina")) && "Pix",
    methods.includes("debit") && "débito",
    methods.includes("cash") && "dinheiro",
  ]
    .filter(Boolean)
    .join(", ")
  if (methods.some((method) => method !== "payment_link")) {
    items.push({
      id: "pagamento",
      label: "Escolha como pagar",
      icon: "cartao",
      title: installments
        ? installments.replace(/^em /, "")
        : methods.includes("credit")
          ? "Crédito e outras opções"
          : "Pagamento à sua escolha",
      detail: [
        installments ? "No cartão de crédito." : "",
        otherMethods && `Aceitamos ${otherMethods}.`,
        payment.minInstallmentCents > 0 &&
          installments &&
          `Parcela mínima de ${formatPrice(payment.minInstallmentCents)}.`,
      ]
        .filter(Boolean)
        .join(" "),
      action: "Consultar condições",
    })
  }
  if (store.addressLine || store.city) {
    items.push({
      id: "loja",
      label: "Compre perto de você",
      icon: "loja",
      title: store.city ? `Loja em ${store.city}` : "Retire na loja",
      detail: [store.district || store.addressLine, "Veja o endereço e os horários de atendimento."]
        .filter(Boolean)
        .join(" · "),
      action: "Como chegar",
    })
  }
  if (methods.includes("payment_link")) {
    items.push({
      id: "online",
      label: "Resolva pelo WhatsApp",
      icon: "online",
      title: "Pague por link",
      detail: "Combine sua compra com a equipe e solicite o link de pagamento.",
      action: "Falar com a equipe",
    })
  }
  if (store.warranty) {
    items.push({
      id: "garantia",
      label: "Antes de comprar",
      title: "Conheça a garantia",
      detail: store.warranty,
      action: "Tirar dúvidas",
      icon: "garantia",
    })
  }
  return items
}
