import { beforeEach, describe, expect, it, vi } from "vitest"

const { createSiteOrder } = vi.hoisted(() => ({ createSiteOrder: vi.fn() }))
vi.mock("@/lib/admin-api", () => ({ createSiteOrder }))

import { POST } from "@/app/api/checkout/route"

const ID = "AbCdEfGhIjKlMnOpQrSt"
const post = (body: unknown) =>
  POST(
    new Request("http://site/api/checkout", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  )

beforeEach(() => createSiteOrder.mockReset())

describe("POST /api/checkout", () => {
  it("repassa ao admin com o id do pedido e devolve o link do Mercado Pago", async () => {
    createSiteOrder.mockResolvedValue({ ok: true, data: { id: ID, payUrl: "https://mp/pay" } })
    const response = await post({ orderId: ID, payload: { items: [] } })
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ orderId: ID, payUrl: "https://mp/pay" })
    expect(createSiteOrder).toHaveBeenCalledWith(ID, { items: [] })
  })

  it("barra corpo que nem é pedido, sem chamar o admin", async () => {
    expect((await post("{quebrado")).status).toBe(400)
    expect((await post({ orderId: "curto", payload: {} })).status).toBe(400)
    expect(createSiteOrder).not.toHaveBeenCalled()
  })

  it("devolve o código e a mensagem do admin; falha do admin vira 502", async () => {
    createSiteOrder.mockResolvedValue({
      ok: false,
      status: 409,
      code: "PRICE_CHANGED",
      error: "O preço mudou.",
    })
    const response = await post({ orderId: ID, payload: {} })
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ code: "PRICE_CHANGED", error: "O preço mudou." })
    createSiteOrder.mockResolvedValue({ ok: false, status: 503, code: "SITE_CHECKOUT_DISABLED" })
    expect((await post({ orderId: ID, payload: {} })).status).toBe(502)
  })

  it("pedido sem link (MP não respondeu) não redireciona", async () => {
    createSiteOrder.mockResolvedValue({ ok: true, data: { id: ID } })
    const response = await post({ orderId: ID, payload: {} })
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ code: "MP_UNAVAILABLE" })
  })
})
