import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Sem o otimizador da Vercel: as fotos do Storage já têm variantes geradas
    // pela extensão Resize Images, e os banners locais têm WebP gerado pelo
    // `scripts/optimize-local-images.mjs`. Ver `lib/image-variants.ts`.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
}

export default nextConfig
