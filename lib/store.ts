import "server-only"
import { firestore } from "@/lib/firebase-admin"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"

export interface SiteStore {
  name: string
  legalName?: string
  cnpj?: string
  phone?: string
  whatsapp: string
  addressLine: string
  cityLine: string
  postalCode?: string
  mapsUrl?: string
  about?: string
  instagram?: string
  facebook?: string
  hours: Array<{ days: string; opens: string; closes: string }>
  brand: {
    logoUrl?: string
    logoDarkUrl?: string
    iconUrl?: string
    ogImageUrl?: string
    color?: string
  }
}

/**
 * Enquanto `settings/store` não estiver preenchido, o site continua de pé com o
 * mínimo — mas sem inventar endereço nem horário: o que não existe, não aparece.
 */
const FALLBACK: SiteStore = {
  name: "SmartPoint",
  whatsapp: "5534998349528",
  addressLine: "",
  cityLine: "",
  hours: [],
  brand: {},
}

export async function getStore(): Promise<SiteStore> {
  const db = firestore()
  if (!db) return FALLBACK

  const snapshot = await db.collection("settings").doc("store").get()
  const data = snapshot.data()
  if (!data) return FALLBACK

  const address = (data.endereco ?? {}) as Record<string, string>
  const street = [address.logradouro, address.numero].filter(Boolean).join(", ")
  const district = [address.bairro, address.complemento].filter(Boolean).join(" · ")
  const city = [address.cidade, address.estado].filter(Boolean).join(", ")

  return {
    name: (data.nomeFantasia as string) || FALLBACK.name,
    legalName: data.razaoSocial as string | undefined,
    cnpj: data.cnpj as string | undefined,
    phone: data.telefone as string | undefined,
    whatsapp: data.whatsapp
      ? normalizeWhatsAppNumber(String(data.whatsapp))
      : data.telefone
        ? normalizeWhatsAppNumber(String(data.telefone))
        : FALLBACK.whatsapp,
    addressLine: [street, district].filter(Boolean).join(" — "),
    cityLine: city,
    postalCode: address.cep,
    mapsUrl: data.mapsUrl as string | undefined,
    about: data.about as string | undefined,
    instagram: (data.social as Record<string, string> | undefined)?.instagram,
    facebook: (data.social as Record<string, string> | undefined)?.facebook,
    hours: Array.isArray(data.hours) ? data.hours : [],
    brand: (data.brand as SiteStore["brand"]) ?? {},
  }
}
