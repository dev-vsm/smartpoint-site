"use client"

import type { ImageLoaderProps } from "next/image"
import { localVariantUrl } from "./image-variants"

/**
 * Loader global do `next/image` (ver `next.config.ts`): entrega variantes já
 * prontas em vez de usar o otimizador da Vercel. O que não tem variante (logo,
 * hero do Storage) sai como está; fotos de produto usam `ProductPhoto`.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  return localVariantUrl(src, width) ?? src
}
