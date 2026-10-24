import type { HoursSlot } from "@/lib/hours"
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

/** Formas de pagamento como o admin grava em `payment.methods`. */
export type PaymentMethod =
  | "credit"
  | "debit"
  | "pix_maquina"
  | "pix_chave"
  | "cash"
  | "payment_link"

const PAYMENT_METHODS: PaymentMethod[] = [
  "credit",
  "debit",
  "pix_maquina",
  "pix_chave",
  "cash",
  "payment_link",
]

export interface StorePayment {
  methods: PaymentMethod[]
  /** Parcelas no crédito; 1 = só à vista. */
  maxInstallments: number
  /** Até quantas parcelas sem juros; 1 = nenhuma. */
  interestFreeInstallments: number
  /** Valor mínimo de cada parcela, em centavos; 0 = sem mínimo. */
  minInstallmentCents: number
}

export interface StorePhoto {
  url: string
  alt?: string
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
  /** Só a cidade ("Uberlândia") e o bairro, para frases como "entrega em toda Uberlândia". */
  city?: string
  district?: string
  postalCode?: string
  /** Derivado do link/embed cadastrado ou do endereço; ausente quando não há onde apontar. */
  map?: StoreMap
  about?: string
  /** Só as redes preenchidas, na ordem de `SOCIAL_NETWORKS`. */
  social: SocialLink[]
  hours: HoursSlot[]
  payment: StorePayment
  /** Fotos da loja (fachada, balcão) — o que prova que ela existe. */
  photos: StorePhoto[]
  /** Garantia padrão da loja; a do produto, quando houver, vale mais. */
  warranty?: string
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
  payment: { methods: [], maxInstallments: 1, interestFreeInstallments: 1, minInstallmentCents: 0 },
  photos: [],
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

/** Inteiro ≥ `min`, ou o padrão. */
function count(value: unknown, fallback: number, min = 1): number {
  const number = Number(value)
  return Number.isFinite(number) && number >= min ? Math.floor(number) : fallback
}

function toPayment(value: unknown): StorePayment {
  const payment = record(value)
  const methods = Array.isArray(payment.methods) ? payment.methods : []
  const maxInstallments = count(payment.maxInstallments, 1)
  return {
    methods: PAYMENT_METHODS.filter((method) => methods.includes(method)),
    maxInstallments,
    interestFreeInstallments: Math.min(count(payment.interestFreeInstallments, 1), maxInstallments),
    minInstallmentCents: count(payment.minInstallmentCents, 0, 0),
  }
}

/** Aceita `["https://…"]` ou `[{ url, alt }]`; ignora o resto. */
function toPhotos(value: unknown): StorePhoto[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const url = typeof item === "string" ? text(item) : text(record(item).url)
    if (!url) return []
    const alt = typeof item === "string" ? undefined : text(record(item).alt)
    return [alt ? { url, alt } : { url }]
  })
}

function toHours(value: unknown): HoursSlot[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const slot = record(item)
    const days = text(slot.days)
    const opens = text(slot.opens)
    const closes = text(slot.closes)
    return days && opens && closes ? [{ days, opens, closes }] : []
  })
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
    city: text(address.cidade),
    district: text(address.bairro),
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
    hours: toHours(data.hours),
    payment: toPayment(data.payment),
    photos: toPhotos(data.photos),
    warranty: text(data.warranty) ?? text(data.garantia),
    brand: record(data.brand) as SiteStore["brand"],
  }
}

/** Cor da barra do navegador e do app instalado: a da marca, se for um hex válido. */
export function brandColor(store: SiteStore): string {
  const color = store.brand.color?.trim()
  return color && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : "#0e7490"
}
