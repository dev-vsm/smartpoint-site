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
}): string {
  const parts = [`Olá! Tenho interesse em ${input.name}`]
  if (input.variant) parts.push(`(${input.variant})`)
  const first = `${parts.join(" ")}.`
  const lines = [first]
  if (input.priceCents) lines.push(`Preço no site: ${formatPrice(input.priceCents)}.`)
  if (input.url) lines.push(input.url)
  return lines.join("\n")
}

export function quoteMessage(input: {
  device: string
  service: string
  problem?: string
  name?: string
}): string {
  const lines = [
    `Olá! Quero um orçamento de ${input.service.toLowerCase()}.`,
    `Aparelho: ${input.device}.`,
  ]
  if (input.problem?.trim()) lines.push(`O que está acontecendo: ${input.problem.trim()}`)
  if (input.name?.trim()) lines.push(`Meu nome é ${input.name.trim()}.`)
  return lines.join("\n")
}
