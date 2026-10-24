/** Junta classes ignorando valores falsos. Sem dependência: o site é enxuto. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ")
}

/** Centavos → "R$ 79,90". O preço nasce em centavos, como no admin. */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

/**
 * Telefone para gente ler: "5534998349528" → "(34) 99834-9528". Aceita o que o
 * admin digitar; se não reconhecer o formato, devolve como veio.
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "")
  const match = digits.match(/^(\d{2})(\d{4,5})(\d{4})$/)
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : raw
}

/**
 * SVG pela extensão do caminho, ignorando a query: a URL do Storage termina em
 * `?alt=media&token=…`, então o `next/image` não percebe sozinho que é SVG.
 */
export function isSvgUrl(url: string): boolean {
  try {
    return decodeURIComponent(new URL(url, "https://x").pathname).toLowerCase().endsWith(".svg")
  } catch {
    return false
  }
}
