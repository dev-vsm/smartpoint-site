import type { NextConfig } from "next"

const dev = process.env.NODE_ENV !== "production"

/**
 * Política de conteúdo: só o que o site usa de fato.
 * - Scripts: os do próprio site. `'unsafe-inline'` porque o Next injeta scripts inline (dados
 *   da renderização e o JSON-LD) e as páginas são estáticas/ISR, sem nonce por requisição.
 * - Imagens: o site e o Firebase Storage (fotos de produto, logo, banners).
 * - Conexões: o site (API própria e Vercel Analytics em `/_vercel`) e o ViaCEP do carrinho.
 * - Iframes: só o mapa do Google Maps. Ninguém pode pôr o site num iframe (clickjacking).
 * Em desenvolvimento entram `eval` e o WebSocket do recarregamento.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com",
  "font-src 'self'",
  `connect-src 'self' https://viacep.com.br${dev ? " ws: https://va.vercel-scripts.com" : ""}`,
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ")

/** Cabeçalhos de segurança de todas as respostas (o HSTS já vem da Vercel). */
export const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
]

const nextConfig: NextConfig = {
  images: {
    // Sem o otimizador da Vercel: as fotos do Storage já têm variantes geradas
    // pela extensão Resize Images, e os banners locais têm WebP gerado pelo
    // `scripts/optimize-local-images.mjs`. Ver `lib/image-variants.ts`.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Link do cliente: o token é o acesso. Não vai em Referer, não fica em cache nem no Google.
      {
        source: "/acompanhar/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ]
  },
}

export default nextConfig
