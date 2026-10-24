import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { RepairBanner } from "@/components/home/repair-banner"

vi.mock("next/image", () => ({ default: () => null }))

let motion = false
beforeEach(() => {
  vi.useFakeTimers()
  motion = false
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: motion, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  vi.spyOn(document, "hidden", "get").mockReturnValue(false)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
const renderBanner = () => render(<RepairBanner whatsapp="5534998349528" />)
const advance = () =>
  act(() => {
    vi.advanceTimersByTime(7000)
  })
const current = () => screen.getByRole("heading", { level: 2 }).textContent

describe("carrossel de assistência", () => {
  it("troca automaticamente e permite pausar e retomar", () => {
    renderBanner()
    expect(current()).toBe("Seu celular em boas mãos.")
    advance()
    expect(current()).toBe("Tela quebrada? Vamos resolver.")
    const pause = screen.getByRole("button", { name: "Pausar troca automática" })
    fireEvent.focus(pause)
    fireEvent.click(pause)
    advance()
    expect(current()).toBe("Tela quebrada? Vamos resolver.")
    fireEvent.click(screen.getByRole("button", { name: "Iniciar troca automática" }))
    advance()
    expect(current()).toBe("A bateria não acompanha seu dia?")
  })
  it("navega pelas setas e indicadores, incluindo o retorno ao início", () => {
    renderBanner()
    fireEvent.click(screen.getByRole("button", { name: "Ver banner: Conector de carga e fone" }))
    expect(current()).toBe("Mau contato? Fale com quem resolve.")
    fireEvent.click(screen.getByRole("button", { name: "Ver banner: Assistência técnica" }))
    expect(current()).toBe("Seu celular em boas mãos.")
    fireEvent.click(screen.getByRole("button", { name: "Ver banner: Troca de bateria" }))
    expect(current()).toBe("A bateria não acompanha seu dia?")
    advance()
    expect(current()).toBe("A bateria não acompanha seu dia?")
  })
  it("oferece apenas o CTA ativo e mensagem específica do serviço", () => {
    renderBanner()
    fireEvent.click(screen.getByRole("button", { name: "Ver banner: Troca de tela" }))
    const link = screen.getByRole("link", { name: "Consultar troca de tela" })
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain(
      "troca de tela com película de brinde",
    )
    expect(link).toHaveAttribute("data-wa-source", "carrossel_tela")
    expect(screen.getAllByRole("link")).toHaveLength(1)
  })
  it("pausa ao passar o mouse e ao focar no atendimento", () => {
    renderBanner()
    const region = screen.getByRole("region", { name: "Serviços e ofertas de assistência técnica" })
    fireEvent.mouseEnter(region)
    advance()
    expect(current()).toBe("Seu celular em boas mãos.")
    fireEvent.mouseLeave(region)
    advance()
    expect(current()).toBe("Tela quebrada? Vamos resolver.")
    fireEvent.focus(screen.getByRole("link"))
    advance()
    expect(current()).toBe("Tela quebrada? Vamos resolver.")
  })
  it("não gira automaticamente quando movimento reduzido está ativo", () => {
    motion = true
    renderBanner()
    advance()
    expect(current()).toBe("Seu celular em boas mãos.")
    expect(screen.queryByRole("button", { name: "Pausar troca automática" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Ver banner: Troca de tela" }))
    expect(current()).toBe("Tela quebrada? Vamos resolver.")
  })
  it("permite teclado e gesto horizontal sem capturar o gesto vertical", () => {
    renderBanner()
    const region = screen.getByRole("region", { name: "Serviços e ofertas de assistência técnica" })
    fireEvent.keyDown(region, { key: "ArrowRight" })
    expect(current()).toBe("Tela quebrada? Vamos resolver.")
    fireEvent.touchStart(region, { touches: [{ clientX: 200, clientY: 20 }] })
    fireEvent.touchEnd(region, { changedTouches: [{ clientX: 100, clientY: 25 }] })
    expect(current()).toBe("A bateria não acompanha seu dia?")
    fireEvent.touchStart(region, { touches: [{ clientX: 200, clientY: 20 }] })
    fireEvent.touchEnd(region, { changedTouches: [{ clientX: 190, clientY: 120 }] })
    expect(current()).toBe("A bateria não acompanha seu dia?")
  })
  it("suspende a troca com a aba oculta", () => {
    renderBanner()
    vi.spyOn(document, "hidden", "get").mockReturnValue(true)
    fireEvent(document, new Event("visibilitychange"))
    advance()
    expect(current()).toBe("Seu celular em boas mãos.")
  })
})
