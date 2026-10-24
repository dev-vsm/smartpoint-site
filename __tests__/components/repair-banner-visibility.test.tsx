import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { RepairBannerVisibility } from "@/components/layout/repair-banner-visibility"

const route = vi.hoisted(() => ({ pathname: "/" }))
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }))
afterEach(cleanup)

describe("visibilidade do banner de assistência", () => {
  it.each(["/", "/produtos", "/sobre", "/contato"])("aparece em %s", (pathname) => {
    route.pathname = pathname
    render(
      <RepairBannerVisibility>
        <p>Assistência</p>
      </RepairBannerVisibility>,
    )
    expect(screen.queryByText("Assistência")).not.toBeNull()
  })
  it.each(["/produtos/capinha", "/produtos/capinha/"])("não aparece em %s", (pathname) => {
    route.pathname = pathname
    render(
      <RepairBannerVisibility>
        <p>Assistência</p>
      </RepairBannerVisibility>,
    )
    expect(screen.queryByText("Assistência")).toBeNull()
  })
  it("atualiza ao navegar do catálogo para um produto e voltar", () => {
    route.pathname = "/produtos"
    const content = () => (
      <RepairBannerVisibility>
        <p>Assistência</p>
      </RepairBannerVisibility>
    )
    const { rerender } = render(content())
    route.pathname = "/produtos/capinha"
    rerender(content())
    expect(screen.queryByText("Assistência")).toBeNull()
    route.pathname = "/"
    rerender(content())
    expect(screen.queryByText("Assistência")).not.toBeNull()
  })
})
