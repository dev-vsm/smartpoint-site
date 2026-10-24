import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SearchField } from "@/components/layout/search-field"

const { push, params } = vi.hoisted(() => ({ push: vi.fn(), params: new URLSearchParams() }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => params,
}))

afterEach(cleanup)
beforeEach(() => push.mockClear())

describe("busca do cabeçalho", () => {
  it("envia a busca pelo botão, removendo espaços e codificando o texto", () => {
    render(<SearchField />)
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "  película & capa  " } })
    fireEvent.click(screen.getByRole("button", { name: "Buscar produtos" }))
    expect(push).toHaveBeenCalledWith("/produtos?q=pel%C3%ADcula%20%26%20capa")
  })

  it("mantém o envio pelo formulário usado pelo teclado", () => {
    render(<SearchField />)
    const input = screen.getByRole("searchbox")
    fireEvent.change(input, { target: { value: "bateria" } })
    const form = input.closest("form")
    if (!form) throw new Error("Campo de busca sem formulário")
    fireEvent.submit(form)
    expect(push).toHaveBeenCalledWith("/produtos?q=bateria")
  })

  it("abre o catálogo completo quando a busca fica vazia", () => {
    render(<SearchField />)
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "   " } })
    fireEvent.click(screen.getByRole("button", { name: "Buscar produtos" }))
    expect(push).toHaveBeenCalledWith("/produtos")
  })
})
