import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Fotos de produto e a marca vivem no Storage do Firebase (ver design doc §6.3).
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.firebasestorage.app" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
}

export default nextConfig
