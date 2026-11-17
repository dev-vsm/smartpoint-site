import { describe, expect, it } from "vitest"
import nextConfig, { securityHeaders } from "@/next.config"

const header = (key: string) => securityHeaders.find((item) => item.key === key)?.value ?? ""

describe("cabeçalhos de segurança", () => {
  it("valem para todas as rotas", async () => {
    const rules = await nextConfig.headers?.()
    expect(rules?.[0]).toEqual({ source: "/:path*", headers: securityHeaders })
    // Link de acompanhamento: o token não vaza em Referer, cache nem busca.
    expect(rules?.[1]).toEqual({
      source: "/acompanhar/:path*",
      headers: [
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Cache-Control", value: "private, no-store" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
      ],
    })
    expect(nextConfig.poweredByHeader).toBe(false)
  })

  it("bloqueiam iframe de terceiros, farejamento de tipo e recursos do aparelho", () => {
    expect(header("X-Frame-Options")).toBe("DENY")
    expect(header("X-Content-Type-Options")).toBe("nosniff")
    expect(header("Referrer-Policy")).toBe("strict-origin-when-cross-origin")
    expect(header("Permissions-Policy")).toContain("camera=()")
    expect(header("Permissions-Policy")).toContain("geolocation=()")
  })

  it("a CSP libera só o que o site usa", () => {
    const csp = header("Content-Security-Policy")
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("https://firebasestorage.googleapis.com")
    expect(csp).toContain("connect-src 'self' https://viacep.com.br")
    expect(csp).toContain("frame-src https://www.google.com")
  })
})
