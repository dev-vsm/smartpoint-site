"use client"

import type { ImageLoaderProps } from "next/image"
import { firebaseVariantUrl, localVariantUrl } from "./image-variants"

/**
 * Loader global do `next/image` (ver `next.config.ts`): entrega variantes já
 * prontas em vez de usar o otimizador da Vercel. O que não tem variante sai
 * como está.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  return firebaseVariantUrl(src, width) ?? localVariantUrl(src, width) ?? src
}
