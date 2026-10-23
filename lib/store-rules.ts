import { buildStoreMap, type StoreMap } from "@/lib/maps"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"

/**
 * Regras puras da loja: como o documento `settings/store` (o mesmo que o admin
 * edita em `/loja`) vira o que o site mostra. Sem Firebase aqui — é o que
 * permite testar contra o formato real do documento.
 */

export type SocialNetwork = "instagram" | "facebook" | "tiktok" | "youtube" | "x"

export interface SocialLink {
  network: SocialNetwork
  label: string
  url: string
}

export interface SiteStore {
  name: string
  legalName?: string
  cnpj?: string
  phone?: string
  email?: string
  whatsapp: string
  addressLine: string
  cityLine: string
  postalCode?: string
  /** Derivado do link/embed cadastrado ou do endereço; ausente quando não há onde apontar. */
  map?: StoreMap
  about?: string
  /** Só as redes preenchidas, na ordem de `SOCIAL_NETWORKS`. */
  social: SocialLink[]
  hours: Array<{ days: string; opens: string; closes: string }>
  brand: {
    logoUrl?: string
    logoDarkUrl?: string
    iconUrl?: string
    ogImageUrl?: string
    color?: string
  }
}

/** Ordem de exibição — a rede que mais traz cliente primeiro. */
const SOCIAL_NETWORKS: Array<{ network: SocialNetwork; label: string }> = [
  { network: "instagram", label: "Instagram" },
  { network: "facebook", label: "Facebook" },
  { network: "tiktok", label: "TikTok" },
  { network: "youtube", label: "YouTube" },
  { network: "x", label: "X" },
]

/**
 * Enquanto `settings/store` não estiver preenchido, o site continua de pé com o
 * mínimo — mas sem inventar endereço nem horário: o que não existe, não aparece.
 */
export const FALLBACK_STORE: SiteStore = {
  name: "SmartPoint",
  whatsapp: "5534998349528",
  addressLine: "",
  cityLine: "",
  social: [],
  hours: [],
  brand: {},
}

type Doc = Record<string, unknown>

/** Texto aparado, ou `undefined` — o admin grava `""` para "não tenho". */
function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function record(value: unknown): Doc {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Doc) : {}
}

/**
 * Documento → loja do site. Lê o formato atual do admin (`redesSociais`,
 * `endereco.googleMapsUrl`…) e aceita os nomes do design doc (`social`,
 * `mapsUrl`, `whatsapp`) como alternativa, para não quebrar se o admin migrar.
 */
export function toSiteStore(data: Doc | undefined): SiteStore {
  if (!data) return FALLBACK_STORE

  const address = record(data.endereco)
  const socials = { ...record(data.social), ...record(data.redesSociais) }

  const street = [text(address.logradouro), text(address.numero)].filter(Boolean).join(", ")
  const district = [text(address.bairro), text(address.complemento)].filter(Boolean).join(" · ")
  const addressLine = [street, district].filter(Boolean).join(" — ")
  const cityLine = [text(address.cidade), text(address.estado)].filter(Boolean).join(", ")
  const postalCode = text(address.cep)

  const phone = text(data.telefone)
  const whatsapp = text(socials.whatsapp) ?? text(data.whatsapp) ?? phone

  return {
    name: text(data.nomeFantasia) ?? FALLBACK_STORE.name,
    legalName: text(data.razaoSocial),
    cnpj: text(data.cnpj),
    phone,
    email: text(data.email),
    whatsapp: whatsapp ? normalizeWhatsAppNumber(whatsapp) : FALLBACK_STORE.whatsapp,
    addressLine,
    cityLine,
    postalCode,
    map: buildStoreMap({
      mapsUrl: text(address.googleMapsUrl) ?? text(data.mapsUrl),
      mapsEmbedUrl: text(address.googleMapsEmbedUrl),
      addressLine,
      cityLine,
      postalCode,
    }),
    about: text(data.about),
    social: SOCIAL_NETWORKS.flatMap(({ network, label }) => {
      const url = text(socials[network])
      return url ? [{ network, label, url }] : []
    }),
    hours: Array.isArray(data.hours) ? data.hours : [],
    brand: record(data.brand) as SiteStore["brand"],
  }
}
