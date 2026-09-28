/** Junta classes ignorando valores falsos. Sem dependência: o site é enxuto. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ")
}

/** Centavos → "R$ 79,90". O preço nasce em centavos, como no admin. */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}
