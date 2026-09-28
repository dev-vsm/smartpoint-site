export interface QuoteInput {
  device: string
  service: string
  problem?: string
  name?: string
}

export type QuoteErrors = Partial<Record<keyof QuoteInput, string>>

/**
 * Validação do pedido de orçamento. São quatro regras — não vale carregar uma
 * biblioteca de schema no navegador por causa disso (orçamento de peso do site).
 */
export function validateQuote(input: Record<string, unknown>): {
  data?: QuoteInput
  errors: QuoteErrors
} {
  const device = String(input.device ?? "").trim()
  const service = String(input.service ?? "").trim()
  const problem = String(input.problem ?? "").trim()
  const name = String(input.name ?? "").trim()
  const errors: QuoteErrors = {}

  if (device.length < 2) errors.device = "Diga a marca e o modelo do aparelho."
  if (service.length < 2) errors.service = "Escolha o que precisa."
  if (problem.length > 600) errors.problem = "Resuma em até 600 caracteres."
  if (name.length > 80) errors.name = "Nome muito longo."

  if (Object.keys(errors).length) return { errors }
  return {
    errors: {},
    data: { device, service, ...(problem ? { problem } : {}), ...(name ? { name } : {}) },
  }
}
