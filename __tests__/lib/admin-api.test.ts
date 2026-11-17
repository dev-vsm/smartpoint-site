import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { checkoutEnabled, createSiteOrder, getSiteOrder, quoteSiteDelivery } from "@/lib/admin-api"

const fetchMock = vi.fn()
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  vi.stubEnv("ADMIN_API_URL", "https://admin.example/")
  vi.stubEnv("SITE_CHECKOUT_SECRET", "segredo")
  fetchMock.mockReset()
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("ponte com o admin", () => {
  it("pede a prévia do frete com o segredo", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ fee: 1000, label: "até 8 km" })))
    expect(await quoteSiteDelivery({ cep: "38408100" })).toEqual({
      ok: true,
      data: { fee: 1000, label: "até 8 km" },
    })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://admin.example/api/site/delivery-quote")
    expect(init).toMatchObject({ method: "POST", body: '{"address":{"cep":"38408100"}}' })
    expect(init.headers).toMatchObject({ authorization: "Bearer segredo" })
  })

  it("cria o pedido com o segredo e a chave de repetição", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "x", payUrl: "u" }), { status: 201 }),
    )
    expect(await createSiteOrder("ID", { a: 1 })).toEqual({
      ok: true,
      data: { id: "x", payUrl: "u" },
    })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://admin.example/api/site/checkout")
    expect(init).toMatchObject({ method: "POST", body: '{"a":1}', cache: "no-store" })
    expect(init.headers).toMatchObject({ authorization: "Bearer segredo", "idempotency-key": "ID" })
  })

  it("devolve o código do erro do admin", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: "ORDER_NOT_FOUND", error: "Pedido não encontrado." }), {
        status: 404,
      }),
    )
    expect(await getSiteOrder("abc")).toEqual({
      ok: false,
      status: 404,
      code: "ORDER_NOT_FOUND",
      error: "Pedido não encontrado.",
    })
  })

  it("sem resposta do admin vira erro de conexão", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    fetchMock.mockRejectedValue(Object.assign(new Error("t"), { name: "TimeoutError" }))
    expect(await getSiteOrder("abc")).toEqual({ ok: false, status: 504, code: "REQUEST_TIMEOUT" })
    fetchMock.mockRejectedValue(new TypeError("fetch failed"))
    expect(await getSiteOrder("abc")).toMatchObject({ code: "NETWORK_ERROR" })
  })

  it("sem configuração, a compra online fica desligada", async () => {
    vi.stubEnv("SITE_CHECKOUT_SECRET", "")
    expect(checkoutEnabled()).toBe(false)
    expect(await createSiteOrder("ID", {})).toEqual({
      ok: false,
      status: 503,
      code: "SITE_CHECKOUT_DISABLED",
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
