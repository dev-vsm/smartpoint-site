import type { MetadataRoute } from "next"
import { listProducts } from "@/lib/catalog"
import { absolute } from "@/lib/seo"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts()
  const now = new Date()

  const pages: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absolute("/produtos"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absolute("/sobre"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: absolute("/contato"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ]

  return [
    ...pages,
    ...products.map((product) => ({
      url: absolute(`/produtos/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
