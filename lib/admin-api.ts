import "server-only"

/**
 * Ponte servidor a servidor com o admin para o checkout do Mercado Pago. O site não grava
 * pedido nenhum: o admin cria o pedido, reserva o estoque e gera o link de pagamento
 * (`/api/site/checkout`, ver docs/features/site-checkout.md no admin). O segredo vive só em
 * variável de ambiente do servidor.
 */

/** O que o admin devolve sobre um pedido do site (`SiteOrderView`). */
export interface SiteOrder {
  id: string
  displayId: string
  status: "awaiting_payment" | "paid" | "cancelled"
  lastAttemptRejected: boolean
  total: number
  subtotal: number
  deliveryFee: number
  fulfillment: "pickup" | "delivery"
  zone?: string
  items: Array<{ name: string; quantity: number; unitPrice: number; total: number; image?: string }>
  payUrl?: string
  expiresAt: number
  customerFirstName: string
}

export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code?: string; error?: string }

const TIMEOUT_MS = 25000

function config() {
  const base = (process.env.ADMIN_API_URL ?? "").trim().replace(/\/+$/, "")
  const secret = (process.env.SITE_CHECKOUT_SECRET ?? "").trim()
  return base && secret ? { base, secret } : null
}

/** A compra online está ligada neste ambiente? (sem configuração, o site segue só com WhatsApp). */
export function checkoutEnabled(): boolean {
  return config() !== null
}

async function call<T>(path: string, init: RequestInit = {}): Promise<AdminResult<T>> {
  const settings = config()
  if (!settings) return { ok: false, status: 503, code: "SITE_CHECKOUT_DISABLED" }
  try {
    const response = await fetch(`${settings.base}${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        ...init.headers,
        authorization: `Bearer ${settings.secret}`,
        "content-type": "application/json",
      },
    })
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        code: typeof body.code === "string" ? body.code : undefined,
        error: typeof body.error === "string" ? body.error : undefined,
      }
    }
    return { ok: true, data: body as T }
  } catch (error) {
    const timeout =
      error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
    console.error("[checkout] admin sem resposta", { path, timeout })
    return { ok: false, status: 504, code: timeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR" }
  }
}

/** Cria o pedido. Repetir com o mesmo `orderId` devolve o mesmo pedido (não cobra duas vezes). */
export function createSiteOrder(orderId: string, payload: unknown) {
  return call<SiteOrder>("/api/site/checkout", {
    method: "POST",
    headers: { "idempotency-key": orderId },
    body: JSON.stringify(payload),
  })
}

/** Frete calculado no admin (Google Maps + faixas de /loja/site). */
export interface DeliveryQuote {
  /** Centavos. */
  fee: number
  /** Faixa aplicada: "até 6 km". */
  label: string
  distanceMeters: number
  /** Bairro e cidade do CEP. */
  district: string
  city: string
}

export function quoteSiteDelivery(address: unknown) {
  return call<DeliveryQuote>("/api/site/delivery-quote", {
    method: "POST",
    body: JSON.stringify({ address }),
  })
}

export function getSiteOrder(orderId: string) {
  return call<SiteOrder>(`/api/site/checkout/${encodeURIComponent(orderId)}`)
}
