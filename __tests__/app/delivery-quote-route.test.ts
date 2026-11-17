import { beforeEach, describe, expect, it, vi } from "vitest"

const { quoteSiteDelivery } = vi.hoisted(() => ({ quoteSiteDelivery: vi.fn() }))
vi.mock("@/lib/admin-api", () => ({ quoteSiteDelivery }))

import { POST } from "@/app/api/delivery-quote/route"

const address = {
  cep: "38408-100",
  street: "Rua A",
  number: "10",
  complement: "ap 2",
  district: "",
  city: "Uberlândia",
  state: "mg",
}
const post = (body: unknown) =>
  POST(
    new Request("http://site/api/delivery-quote", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  )

beforeEach(() => quoteSiteDelivery.mockReset())

describe("POST /api/delivery-quote", () => {
  it("repassa o endereço limpo ao admin e devolve só o que o carrinho mostra", async () => {
    quoteSiteDelivery.mockResolvedValue({
      ok: true,
      data: {
        fee: 1000,
        label: "até 8 km",
        distanceMeters: 4200,
        district: "Santa Mônica",
        city: "Uberlândia",
        extra: "x",
      },
    })
    const response = await post({ address })
    expect(await response.json()).toEqual({
      fee: 1000,
      label: "até 8 km",
      distanceMeters: 4200,
      district: "Santa Mônica",
      city: "Uberlândia",
    })
    expect(quoteSiteDelivery).toHaveBeenCalledWith({ ...address, cep: "38408100", state: "MG" })
  })

  it("barra endereço incompleto sem chamar o admin (nem o Google)", async () => {
    expect((await post("{quebrado")).status).toBe(400)
    expect((await post({ address: { ...address, number: "" } })).status).toBe(400)
    expect((await post({ address: { ...address, cep: 38408100 } })).status).toBe(400)
    expect((await post({})).status).toBe(400)
    expect(quoteSiteDelivery).not.toHaveBeenCalled()
  })

  it("devolve o código e a mensagem do admin; falha do admin vira 502", async () => {
    quoteSiteDelivery.mockResolvedValue({
      ok: false,
      status: 409,
      code: "DELIVERY_UNAVAILABLE",
      error: "Longe.",
    })
    const far = await post({ address })
    expect(far.status).toBe(409)
    expect(await far.json()).toEqual({ code: "DELIVERY_UNAVAILABLE", error: "Longe." })
    quoteSiteDelivery.mockResolvedValue({ ok: false, status: 503, code: "DELIVERY_QUOTE_FAILED" })
    expect((await post({ address })).status).toBe(502)
  })
})
