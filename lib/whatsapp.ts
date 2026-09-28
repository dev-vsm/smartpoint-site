/**
 * Links de WhatsApp — o único canal de conversão do site (ver docs/design-doc.md §8).
 * O número vem de `settings/store.whatsapp`; aqui só normalizamos e montamos a URL.
 */

/** Deixa só os dígitos e garante o código do país (55). */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  return digits.startsWith("55") ? digits : `55${digits}`
}

export function buildWhatsAppUrl(number: string, message?: string): string {
  const url = `https://wa.me/${normalizeWhatsAppNumber(number)}`
  if (!message?.trim()) return url
  return `${url}?text=${encodeURIComponent(message.trim())}`
}
