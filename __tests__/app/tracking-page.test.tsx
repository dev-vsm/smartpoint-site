import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
const mocks = vi.hoisted(() => ({
  getOrderTracking: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND")
  }),
}))
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }))
vi.mock("@/lib/admin-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/admin-api")>()),
  getOrderTracking: mocks.getOrderTracking,
}))
vi.mock("@/lib/store", () => ({ getStore: async () => ({ whatsapp: "34999990000" }) }))
vi.mock("@/components/layout/footer", () => ({ Footer: () => null }))
vi.mock("@/components/layout/page-shell", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

import TrackingPage from "@/app/acompanhar/[token]/page"

/** Página do cliente: etapas do pedido pelo link assinado, sem dado pessoal. */
const TOKEN = `${"A".repeat(22)}.${"b".repeat(43)}`
const page = async (token: string) =>
  render(await TrackingPage({ params: Promise.resolve({ token }) } as never))
const steps = [
  {
    stage: "created",
    label: "Pedido criado",
    done: true,
    current: false,
    at: Date.UTC(2026, 10, 17, 13),
  },
  { stage: "awaiting_payment", label: "Pendente de pagamento", done: true, current: false },
  { stage: "paid", label: "Pago", done: true, current: false },
  { stage: "separated", label: "Separado", done: true, current: true },
  { stage: "shipped", label: "Enviado", done: false, current: false },
  { stage: "delivered", label: "Entregue", done: false, current: false },
]

beforeEach(() => {
  mocks.getOrderTracking.mockReset()
  mocks.notFound.mockClear()
})

describe("/acompanhar/[token]", () => {
  it("mostra a etapa atual, as seis etapas e os itens", async () => {
    mocks.getOrderTracking.mockResolvedValue({
      ok: true,
      data: {
        displayId: "ABC123",
        customerFirstName: "Maria",
        fulfillment: "delivery",
        cancelled: false,
        steps,
        items: [{ name: "Capa", quantity: 2 }],
        total: 9980,
      },
    })
    await page(TOKEN)
    expect(mocks.getOrderTracking).toHaveBeenCalledWith(TOKEN)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Maria, seu pedido: separado",
    )
    const items = screen.getAllByRole("listitem")
    expect(
      screen.getByRole("list", { name: "Etapas do pedido" }).querySelectorAll("li"),
    ).toHaveLength(6)
    expect(items.find((item) => item.getAttribute("aria-current") === "step")).toHaveTextContent(
      "Separado",
    )
    expect(screen.getByText("2x Capa")).toBeInTheDocument()
  })

  it("token fora do formato nem chama o admin; desconhecido no admin vira 404", async () => {
    await expect(page("SiteOrder0000000001A")).rejects.toThrow("NOT_FOUND")
    expect(mocks.getOrderTracking).not.toHaveBeenCalled()
    mocks.getOrderTracking.mockResolvedValue({ ok: false, status: 404, code: "TRACKING_NOT_FOUND" })
    await expect(page(TOKEN)).rejects.toThrow("NOT_FOUND")
  })

  it("admin fora do ar: avisa e oferece o WhatsApp", async () => {
    mocks.getOrderTracking.mockResolvedValue({ ok: false, status: 504, code: "NETWORK_ERROR" })
    await page(TOKEN)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Não conseguimos consultar o pedido agora",
    )
  })
})
