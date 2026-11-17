import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { BuyTogether } from "@/components/catalog/buy-together"
import { DeliveryEstimator } from "@/components/catalog/delivery-estimator"
import { ProductGallery } from "@/components/catalog/product-gallery"
import { cartActions, cartDrawer } from "@/lib/cart-store"
import type { ProductImage } from "@/lib/product-media"

const track = vi.hoisted(() => vi.fn())
vi.mock("@vercel/analytics", () => ({ track }))

const photo = (id: string): ProductImage => ({
  id,
  src: `https://img/${id}_400.webp`,
  srcSet: "",
  original: `https://img/${id}.jpg`,
  width: 800,
  height: 800,
  alt: `Foto ${id}`,
})
const fetchMock = vi.fn()

beforeEach(() => {
  track.mockReset()
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  window.localStorage.clear()
  act(() => {
    cartActions.clear()
    cartDrawer.close()
  })
  // jsdom não implementa o <dialog>.
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "")
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open")
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("galeria da página do produto", () => {
  it("contador, setas, miniaturas e arrastar trocam a foto; tocar amplia e o fundo fecha", () => {
    render(<ProductGallery media={[photo("a"), photo("b"), photo("c")]} name="Capa" />)
    expect(screen.getAllByText("1/3")[0]).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole("button", { name: "Próxima foto" })[0])
    expect(screen.getAllByText("2/3")[0]).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole("button", { name: "Foto anterior" })[0])
    fireEvent.click(screen.getAllByRole("button", { name: "Foto anterior" })[0])
    expect(screen.getAllByText("3/3")[0]).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Foto 1" }))

    const main = screen.getByRole("button", { name: /Ampliar foto 1 de 3/ })
    fireEvent.pointerDown(main, { clientX: 200 })
    fireEvent.pointerUp(main, { clientX: 100 })
    fireEvent.click(main) // o clique que fecha o arrasto não amplia
    expect(screen.getAllByText("2/3")[0]).toBeInTheDocument()
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled()

    const zoom = screen.getByRole("button", { name: /Ampliar foto 2 de 3/ })
    fireEvent.pointerDown(zoom, { clientX: 100 })
    fireEvent.pointerUp(zoom, { clientX: 105 })
    fireEvent.click(zoom)
    const dialog = screen.getByRole("dialog", { hidden: true })
    expect(dialog).toHaveAttribute("open")
    expect(dialog.querySelector("img")).toHaveAttribute("src", "https://img/b.jpg")
    fireEvent.keyDown(dialog, { key: "ArrowRight" })
    expect(dialog.querySelector("img")).toHaveAttribute("src", "https://img/c.jpg")
    fireEvent.click(dialog)
    expect(dialog).not.toHaveAttribute("open")
  })

  it("uma foto só: sem contador nem setas", () => {
    render(<ProductGallery media={[photo("a")]} name="Capa" />)
    expect(screen.queryByText("1/1")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Próxima foto" })).not.toBeInTheDocument()
  })
})

describe("calcule o frete", () => {
  const fill = () => {
    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "38408-100" } })
    fireEvent.change(screen.getByLabelText("Número"), { target: { value: "10" } })
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }))
  }

  it("busca a rua no ViaCEP, cota no admin e mostra o frete", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            logradouro: "Rua A",
            bairro: "Santa Mônica",
            localidade: "Uberlândia",
            uf: "MG",
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fee: 1000,
            label: "até 8 km",
            distanceMeters: 4200,
            district: "Santa Mônica",
          }),
        ),
      )
    render(<DeliveryEstimator />)
    expect(screen.getByRole("button", { name: "Calcular" })).toBeDisabled()
    fill()
    expect(await screen.findByText("R$ 10,00")).toBeInTheDocument()
    expect(screen.getByText(/Frete para Santa Mônica/)).toBeInTheDocument()
    expect(screen.getByText(/4,2 km da loja/)).toBeInTheDocument()
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).address).toMatchObject({
      cep: "38408100",
      street: "Rua A",
      number: "10",
    })
    expect(track).toHaveBeenCalledWith("frete_cotado", { origem: "produto", frete: 1000 })
  })

  it("CEP inexistente, recusa do frete e falha de conexão viram aviso", async () => {
    render(<DeliveryEstimator />)
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ erro: true })))
    fill()
    expect(await screen.findByText(/CEP não encontrado/)).toBeInTheDocument()

    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ logradouro: "Rua A" })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ code: "DELIVERY_UNAVAILABLE", error: "Entregamos até 8 km da loja." }),
          { status: 409 },
        ),
      )
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }))
    expect(await screen.findByText("Entregamos até 8 km da loja.")).toBeInTheDocument()

    fetchMock.mockRejectedValueOnce(new TypeError("offline"))
    fireEvent.click(screen.getByRole("button", { name: "Calcular" }))
    await waitFor(() =>
      expect(screen.getByText(/Não conseguimos calcular o frete agora/)).toBeInTheDocument(),
    )
  })
})

describe("compre junto", () => {
  const item = {
    productId: "capa",
    slug: "capa",
    name: "Capa S24",
    priceCents: 3990,
    maxQuantity: 3,
  }
  const complement = {
    id: "pel",
    slug: "pel",
    name: "Película S24",
    priceCents: 2490,
    stock: 2,
    cover: photo("p"),
  }

  it("adiciona os dois ao carrinho e abre o drawer", () => {
    render(<BuyTogether item={item} model="Galaxy S24" complements={[complement]} />)
    expect(screen.getByText("Também servem no Galaxy S24.")).toBeInTheDocument()
    const add = screen.getByRole("button", { name: /Adicionar os dois/ })
    expect(add).toHaveTextContent("R$ 64,80")
    fireEvent.click(add)
    expect(
      JSON.parse(window.localStorage.getItem("smartpoint:cart:v1") ?? "[]").map(
        (entry: { productId: string }) => entry.productId,
      ),
    ).toEqual(["capa", "pel"])
    expect(track).toHaveBeenCalledWith("compre_junto", { produto: "capa", complemento: "pel" })
  })

  it("sem compra online, só os links; sem complementos, nada", () => {
    const { container, rerender } = render(
      <BuyTogether item={null} model="Galaxy S24" complements={[complement]} />,
    )
    expect(screen.queryByRole("button", { name: /Adicionar os dois/ })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Película S24" })).toHaveAttribute(
      "href",
      "/produtos/pel",
    )
    rerender(<BuyTogether item={null} model="Galaxy S24" complements={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
