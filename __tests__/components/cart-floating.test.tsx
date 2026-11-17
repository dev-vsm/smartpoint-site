import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AddToCart } from "@/components/cart/add-to-cart"
import { CartFloating } from "@/components/cart/cart-floating"
import { cartActions, cartDrawer } from "@/lib/cart-store"

const route = vi.hoisted(() => ({ pathname: "/" }))
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }))

const capa = {
  productId: "p1",
  slug: "capa",
  name: "Capa iPhone",
  priceCents: 4990,
  maxQuantity: 2,
}
const toggle = () => screen.getByRole("button", { name: /^Carrinho/ })
const drawer = () => screen.getByRole("dialog", { name: "Seu carrinho", hidden: true })

beforeEach(() => {
  route.pathname = "/"
  window.localStorage.clear()
  act(() => {
    cartActions.clear()
    cartDrawer.close()
  })
})
afterEach(cleanup)

describe("carrinho flutuante", () => {
  it("o botão mostra quantos itens há e abre o drawer com os produtos e o atalho do carrinho", () => {
    act(() => cartActions.add(capa))
    render(<CartFloating />)
    expect(toggle()).toHaveAccessibleName("Carrinho, 1 item")
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(drawer()).toHaveAttribute("inert")

    fireEvent.click(toggle())
    expect(toggle()).toHaveAttribute("aria-expanded", "true")
    expect(drawer()).not.toHaveAttribute("inert")
    expect(drawer()).toHaveFocus()
    expect(screen.getByText("Seu carrinho (1 item)")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Capa iPhone" })).toHaveAttribute(
      "href",
      "/produtos/capa",
    )
    expect(screen.getByRole("link", { name: "Ir para o carrinho" })).toHaveAttribute(
      "href",
      "/carrinho",
    )

    const plus = screen.getByRole("button", { name: "Mais um: Capa iPhone" })
    fireEvent.click(plus)
    expect(plus).toBeDisabled()
    expect(screen.getAllByText("R$ 99,80")).toHaveLength(2)
    fireEvent.click(screen.getByRole("button", { name: "Tirar um: Capa iPhone" }))
    fireEvent.click(screen.getByRole("button", { name: "Tirar um: Capa iPhone" }))
    expect(screen.getByText(/Seu carrinho está vazio/)).toBeInTheDocument()
    expect(toggle()).toHaveAccessibleName("Carrinho vazio")
  })

  it("fecha no ×, no Esc e clicando fora, sem cobrir a página", () => {
    render(
      <>
        <p>Página</p>
        <CartFloating />
      </>,
    )
    fireEvent.click(toggle())
    fireEvent.click(screen.getByRole("button", { name: "Fechar o carrinho" }))
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(toggle()).toHaveFocus()

    fireEvent.click(toggle())
    fireEvent.keyDown(document, { key: "Escape" })
    expect(toggle()).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(toggle())
    fireEvent.pointerDown(drawer())
    expect(toggle()).toHaveAttribute("aria-expanded", "true")
    fireEvent.pointerDown(screen.getByText("Página"))
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
  })

  it("adicionar na página do produto abre o drawer e respeita o estoque", () => {
    render(
      <>
        <AddToCart item={capa} />
        <CartFloating />
      </>,
    )
    fireEvent.click(screen.getByRole("button", { name: /Adicionar ao carrinho/ }))
    expect(toggle()).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: "Ver carrinho (1)" })).toHaveAttribute(
      "href",
      "/carrinho",
    )
    fireEvent.click(screen.getByRole("button", { name: /Adicionar mais um/ }))
    expect(screen.getByRole("button", { name: /Máximo em estoque/ })).toBeDisabled()
  })

  it("some no carrinho e na página do pedido", () => {
    route.pathname = "/carrinho"
    const { unmount } = render(<CartFloating />)
    expect(screen.queryByRole("button", { name: /^Carrinho/ })).not.toBeInTheDocument()
    unmount()
    route.pathname = "/pedido/abcdefghij0123456789"
    render(<CartFloating />)
    expect(screen.queryByRole("button", { name: /^Carrinho/ })).not.toBeInTheDocument()
  })
})
