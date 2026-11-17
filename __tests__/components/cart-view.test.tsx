import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CartView } from "@/components/cart/cart-view"
import { cartActions } from "@/lib/cart-store"

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }))

const delivery = {
  pickup: true,
  ranges: [
    { upToKm: 3, fee: 0 },
    { upToKm: 8, fee: 1000 },
  ],
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const viaCep = () =>
  json({ logradouro: "Rua A", bairro: "Santa Mônica", localidade: "Uberlândia", uf: "MG" })

/** Responde pelo endereço chamado: ViaCEP, prévia do frete e criação do pedido. */
function route(handlers: {
  quote?: () => Response | Promise<Response>
  checkout?: () => Response
}) {
  fetchMock.mockImplementation(async (url: string) => {
    if (url.includes("viacep")) return viaCep()
    if (url === "/api/delivery-quote") return handlers.quote?.() ?? json({}, 500)
    if (url === "/api/checkout") return handlers.checkout?.() ?? json({}, 500)
    throw new Error(`fetch inesperado: ${url}`)
  })
}
/** Botão principal do formulário ("Pagar R$ 59,90 com segurança"); a barra do celular é outro. */
const payButton = () => screen.getByRole("button", { name: /^Pagar R\$/ })
const calls = (url: string) => fetchMock.mock.calls.filter((call) => call[0] === url)

async function fillAddress(number = "10") {
  fireEvent.click(screen.getByRole("radio", { name: /Entrega em Uberlândia/ }))
  fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "38408100" } })
  await waitFor(() => expect(screen.getByLabelText("Rua")).toHaveValue("Rua A"))
  fireEvent.change(screen.getByLabelText("Número"), { target: { value: number } })
}
const capa = {
  productId: "p1",
  slug: "capa",
  name: "Capa iPhone",
  priceCents: 4990,
  maxQuantity: 3,
}
const fetchMock = vi.fn()
const assign = vi.fn()

function renderCart(props: Partial<Parameters<typeof CartView>[0]> = {}) {
  return render(
    <CartView
      delivery={delivery}
      storeCity="Uberlândia"
      pickupAddress="Av. João Pinheiro, 337"
      whatsapp="5534998349528"
      checkoutEnabled
      store={{
        name: "SmartPoint",
        city: "Uberlândia",
        cnpj: "59.237.018/0001-54",
        address: "Rua A, 1",
      }}
      pix
      card
      {...props}
    />,
  )
}

function fillContact() {
  fireEvent.change(screen.getByLabelText("Nome e sobrenome"), { target: { value: "Maria Souza" } })
  fireEvent.change(screen.getByLabelText("WhatsApp com DDD"), { target: { value: "34999991234" } })
  fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: "maria@exemplo.com" } })
}

beforeEach(() => {
  window.localStorage.clear()
  act(() => cartActions.clear())
  vi.stubGlobal("fetch", fetchMock)
  fetchMock.mockReset()
  assign.mockReset()
  Object.defineProperty(window, "location", {
    value: { ...window.location, assign },
    writable: true,
  })
  window.scrollTo = vi.fn()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("carrinho e finalização", () => {
  it("carrinho vazio leva para os produtos", () => {
    renderCart()
    expect(screen.getByText("Seu carrinho está vazio.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Ver produtos" })).toHaveAttribute("href", "/produtos")
  })

  it("muda quantidade dentro do estoque e remove", () => {
    act(() => cartActions.add(capa))
    renderCart()
    const plus = screen.getByRole("button", { name: "Mais um: Capa iPhone" })
    fireEvent.click(plus)
    fireEvent.click(plus)
    expect(plus).toBeDisabled()
    expect(screen.getAllByText("R$ 149,70").length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole("button", { name: "Remover" }))
    expect(screen.getByText("Seu carrinho está vazio.")).toBeInTheDocument()
  })

  it("retirada: valida os campos, cria o pedido e vai para o Mercado Pago", async () => {
    act(() => cartActions.add(capa))
    renderCart()
    fireEvent.click(payButton())
    expect(screen.getByText("Informe nome e sobrenome.")).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()

    fillContact()
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ payUrl: "https://mp/pay" }), { status: 201 }),
    )
    fireEvent.click(payButton())
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://mp/pay"))
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.orderId).toMatch(/^[A-Za-z0-9]{20}$/)
    expect(body.payload).toMatchObject({
      items: [{ productId: "p1", quantity: 1, unitPrice: 4990 }],
      fulfillment: { type: "pickup" },
    })
  })

  it("entrega: busca o CEP, calcula o frete pela distância e soma no total", async () => {
    act(() => cartActions.add(capa))
    route({
      quote: () =>
        json({
          fee: 1000,
          label: "até 8 km",
          distanceMeters: 4200,
          district: "Santa Mônica",
          city: "Uberlândia",
        }),
      checkout: () => json({ payUrl: "https://mp/pay" }, 201),
    })
    renderCart()
    expect(screen.getByText(/Frete pela distância · até 8 km da loja/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("radio", { name: /Entrega em Uberlândia/ }))
    expect(screen.getByText("Informe CEP, rua e número para calcular o frete.")).toBeInTheDocument()
    await fillAddress()
    expect(
      await screen.findByText("R$ 10,00", { selector: "strong" }, { timeout: 3000 }),
    ).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Frete para Santa Mônica")
    expect(screen.getByRole("status")).toHaveTextContent("4,2 km da loja · faixa até 8 km")
    expect(payButton()).toHaveTextContent("Pagar R$ 59,90 com segurança")
    expect(JSON.parse(calls("/api/delivery-quote")[0][1].body)).toEqual({
      address: {
        cep: "38408100",
        street: "Rua A",
        number: "10",
        complement: "",
        district: "Santa Mônica",
        city: "Uberlândia",
        state: "MG",
      },
    })

    // Complemento não muda o frete: não consulta de novo.
    fireEvent.change(screen.getByLabelText("Complemento"), { target: { value: "ap 2" } })
    fillContact()
    fireEvent.click(payButton())
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://mp/pay"))
    expect(calls("/api/delivery-quote")).toHaveLength(1)
    expect(JSON.parse(calls("/api/checkout")[0][1].body).payload.fulfillment).toMatchObject({
      type: "delivery",
      expectedFee: 1000,
      address: { complement: "ap 2" },
    })
  })

  it("entrega: sem frete calculado não paga online e oferece retirada ou WhatsApp", async () => {
    act(() => cartActions.add(capa))
    route({
      quote: () =>
        json(
          {
            code: "DELIVERY_UNAVAILABLE",
            error:
              "Entregamos até 8 km da loja, e esse endereço fica a 12,4 km. Escolha a retirada na loja.",
          },
          409,
        ),
    })
    renderCart()
    await fillAddress()
    expect(await screen.findByRole("alert", {}, { timeout: 3000 })).toHaveTextContent(
      "fica a 12,4 km",
    )
    expect(payButton()).toBeDisabled()
    const whatsapp = screen.getByRole("link", { name: /Combinar pelo WhatsApp/ })
    expect(decodeURIComponent(whatsapp.getAttribute("href") ?? "")).toContain(
      "Entrega: Rua A, 10, Santa Mônica (CEP 38408100)",
    )
    fireEvent.click(screen.getByRole("button", { name: "Retirar na loja" }))
    expect(screen.getByRole("radio", { name: /Retirar na loja/ })).toBeChecked()
    expect(payButton()).toBeEnabled()
  })

  it("entrega: Google fora do ar ou sem conexão viram aviso, e o endereço novo consulta de novo", async () => {
    act(() => cartActions.add(capa))
    let answer: () => Response | Promise<Response> = () =>
      json({ code: "DELIVERY_QUOTE_FAILED", error: "Não conseguimos calcular o frete agora." }, 502)
    route({ quote: () => answer() })
    renderCart()
    await fillAddress()
    expect(await screen.findByRole("alert", {}, { timeout: 3000 })).toHaveTextContent(
      "Não conseguimos calcular o frete agora.",
    )

    answer = () => Promise.reject(new TypeError("offline"))
    fireEvent.change(screen.getByLabelText("Número"), { target: { value: "12" } })
    await waitFor(() => expect(calls("/api/delivery-quote")).toHaveLength(2), { timeout: 3000 })
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Escolha a retirada na loja ou fale com a loja pelo WhatsApp.",
      ),
    )

    // Admin fora do ar: aviso de frete, nunca "falha no pagamento".
    answer = () => json({ code: "NETWORK_ERROR" }, 502)
    fireEvent.change(screen.getByLabelText("Número"), { target: { value: "14" } })
    await waitFor(() => expect(calls("/api/delivery-quote")).toHaveLength(3), { timeout: 3000 })
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Não conseguimos calcular o frete agora.",
      ),
    )
    expect(screen.getByRole("alert")).not.toHaveTextContent("pagamento")
  })

  it("entrega: o admin avisa que o frete mudou e o carrinho recalcula", async () => {
    act(() => cartActions.add(capa))
    let fee = 0
    route({
      quote: () =>
        json({
          fee,
          label: "até 3 km",
          distanceMeters: 2000,
          district: "Santa Mônica",
          city: "Uberlândia",
        }),
      checkout: () =>
        json(
          { code: "PRICE_CHANGED", error: "O frete para esse endereço mudou para R$ 10,00." },
          409,
        ),
    })
    renderCart()
    await fillAddress()
    expect(await screen.findByText("grátis", {}, { timeout: 3000 })).toBeInTheDocument()
    fillContact()
    fee = 1000
    fireEvent.click(payButton())
    expect(
      await screen.findByText("O frete para esse endereço mudou para R$ 10,00."),
    ).toBeInTheDocument()
    expect(
      await screen.findByText("R$ 10,00", { selector: "strong" }, { timeout: 3000 }),
    ).toBeInTheDocument()
    expect(calls("/api/delivery-quote")).toHaveLength(2)
  })

  it("erro do admin aparece para o cliente; falha de conexão reaproveita o mesmo pedido", async () => {
    act(() => cartActions.add(capa))
    renderCart()
    fillContact()
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: "PRICE_CHANGED",
          error: "O preço de Capa iPhone mudou para R$ 54,90.",
        }),
        { status: 409 },
      ),
    )
    fireEvent.click(payButton())
    expect(await screen.findByRole("alert")).toHaveTextContent("mudou para R$ 54,90")

    fetchMock.mockRejectedValueOnce(new TypeError("offline"))
    fireEvent.click(payButton())
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Sem resposta do servidor"),
    )
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ payUrl: "https://mp/pay" }), { status: 201 }),
    )
    fireEvent.click(payButton())
    await waitFor(() => expect(assign).toHaveBeenCalled())
    const ids = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body).orderId)
    expect(ids[1]).not.toBe(ids[0])
    expect(ids[2]).toBe(ids[1])
  })

  it("mostra o que dá confiança para pagar: segurança, próximos passos, loja e ajuda", () => {
    act(() => cartActions.add({ ...capa, note: "Garantia de 90 dias · iPhone 15" }))
    renderCart({ installments: "em até 12x" })
    expect(screen.getByText("Garantia de 90 dias · iPhone 15")).toBeInTheDocument()
    expect(screen.getByText("Pagamento seguro pelo Mercado Pago")).toBeInTheDocument()
    expect(screen.getByText(/a loja não vê nem guarda/)).toBeInTheDocument()
    expect(screen.getByText("Pix · aprovado na hora")).toBeInTheDocument()
    expect(screen.getByText("Cartão em até 12x")).toBeInTheDocument()
    // Desktop (coluna dos itens) e celular (junto do pagamento): o CSS escolhe qual aparece.
    expect(screen.getAllByText("Depois de pagar")).toHaveLength(2)
    expect(
      screen.getAllByText(/avisa no seu WhatsApp quando o pedido estiver separado/),
    ).toHaveLength(2)
    expect(screen.getAllByText("Loja física em Uberlândia")).toHaveLength(2)
    expect(screen.getAllByText(/CNPJ 59.237.018\/0001-54/)).toHaveLength(2)
    const help = screen.getByRole("link", { name: "Fale com a gente antes de pagar" })
    expect(decodeURIComponent(help.getAttribute("href") ?? "")).toContain("dúvida antes de pagar")
    expect(screen.getByRole("link", { name: "Privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    )
    expect(screen.getByRole("list", { name: "Etapas da compra" })).toHaveTextContent("Seus dados")
    // Celular: total e pagamento presos no rodapé, enviando o mesmo formulário.
    expect(screen.getByRole("button", { name: "Pagar com segurança" })).toHaveAttribute(
      "form",
      "checkout-form",
    )
  })

  it("entrega começa com o CEP e o número do frete calculado na página do produto", async () => {
    window.sessionStorage.setItem(
      "smartpoint:frete:v1",
      JSON.stringify({ cep: "38408-100", number: "10" }),
    )
    act(() => cartActions.add(capa))
    route({
      quote: () =>
        json({
          fee: 0,
          label: "até 3 km",
          distanceMeters: 1000,
          district: "Santa Mônica",
          city: "Uberlândia",
        }),
    })
    renderCart()
    fireEvent.click(screen.getByRole("radio", { name: /Entrega em Uberlândia/ }))
    expect(screen.getByLabelText("CEP")).toHaveValue("38408100")
    expect(screen.getByLabelText("Número")).toHaveValue("10")
    await waitFor(() => expect(screen.getByLabelText("Rua")).toHaveValue("Rua A"))
    window.sessionStorage.clear()
  })

  it("sem a compra online configurada, manda o carrinho pelo WhatsApp", () => {
    act(() => cartActions.add(capa))
    renderCart({ checkoutEnabled: false })
    const link = screen.getByRole("link", { name: /Comprar pelo WhatsApp/ })
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain("1x Capa iPhone")
  })
})
