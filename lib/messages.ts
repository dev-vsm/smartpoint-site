import type { Availability } from "@/lib/catalog-rules"
import { formatPrice } from "@/lib/utils"

/**
 * Mensagens que abrem a conversa no WhatsApp. O atendimento precisa começar
 * sabendo do que se trata — nome, variação, preço e link do produto.
 */
export function productMessage(input: {
  name: string
  priceCents?: number
  variant?: string
  url?: string
  /** Sem estoque, a conversa já começa pedindo encomenda ou aviso de chegada. */
  availability?: Availability
}): string {
  const parts = [`Olá! Tenho interesse em ${input.name}`]
  if (input.variant) parts.push(`(${input.variant})`)
  const first = `${parts.join(" ")}.`
  const lines = [first]
  if (input.availability === "on_order") lines.push("Quero encomendar: qual o prazo?")
  if (input.availability === "sold_out") lines.push("Vi que está esgotado. Me avisa quando chegar?")
  if (input.priceCents) lines.push(`Preço no site: ${formatPrice(input.priceCents)}.`)
  if (input.url) lines.push(input.url)
  return lines.join("\n")
}
