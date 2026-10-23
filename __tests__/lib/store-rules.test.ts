import { describe, expect, it } from "vitest"
import { FALLBACK_STORE, toSiteStore } from "@/lib/store-rules"

/** Formato real de `settings/store`, como o admin grava hoje. */
const doc = {
  nomeFantasia: "smartpoint",
  razaoSocial: "smartpoint celulares",
  cnpj: "59.237.018/0001-54",
  email: "loja@exemplo.com",
  telefone: "(34) 99834-9528",
  endereco: {
    logradouro: "Rua Alaor Carlos Garcia",
    numero: "455",
    bairro: "Jardim Brasília",
    complemento: "3-803",
    cidade: "Uberlândia",
    estado: "MG",
    cep: "38401-883",
    googleMapsUrl: "https://maps.app.goo.gl/abc",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18",
  },
  hours: [
    { days: "Segunda a sexta", opens: "09:30", closes: "20:00" },
    { days: "", opens: "09:00", closes: "12:00" },
  ],
  photos: [
    "https://cdn/fachada.jpg",
    { url: "https://cdn/balcao.jpg", alt: "Balcão" },
    { alt: "x" },
  ],
  payment: {
    interestFreeInstallments: 1,
    minInstallmentCents: 0,
    maxInstallments: 12,
    methods: ["credit", "debit", "pix_maquina", "pix_chave", "cash", "payment_link", "boleto"],
  },
  redesSociais: {
    whatsapp: "(34) 99834-9528",
    instagram: "https://www.instagram.com/udiasmartpoint/",
    facebook: "",
    tiktok: "",
    youtube: "",
    x: "",
  },
}

describe("toSiteStore", () => {
  it("sem documento, usa o mínimo", () => {
    expect(toSiteStore(undefined)).toBe(FALLBACK_STORE)
  })

  it("lê o formato atual do admin", () => {
    const store = toSiteStore(doc)
    expect(store).toMatchObject({
      name: "smartpoint",
      legalName: "smartpoint celulares",
      cnpj: "59.237.018/0001-54",
      email: "loja@exemplo.com",
      whatsapp: "5534998349528",
      addressLine: "Rua Alaor Carlos Garcia, 455 — Jardim Brasília · 3-803",
      cityLine: "Uberlândia, MG",
      postalCode: "38401-883",
    })
  })

  it("horário, fotos e pagamento: só o que é válido", () => {
    const store = toSiteStore(doc)
    expect(store.city).toBe("Uberlândia")
    expect(store.district).toBe("Jardim Brasília")
    expect(store.hours).toEqual([{ days: "Segunda a sexta", opens: "09:30", closes: "20:00" }])
    expect(store.photos).toEqual([
      { url: "https://cdn/fachada.jpg" },
      { url: "https://cdn/balcao.jpg", alt: "Balcão" },
    ])
    expect(store.payment).toEqual({
      methods: ["credit", "debit", "pix_maquina", "pix_chave", "cash", "payment_link"],
      maxInstallments: 12,
      interestFreeInstallments: 1,
      minInstallmentCents: 0,
    })
  })

  it("pagamento ausente ou torto vira só à vista, sem método", () => {
    expect(toSiteStore({}).payment).toEqual(FALLBACK_STORE.payment)
    expect(
      toSiteStore({ payment: { maxInstallments: 3, interestFreeInstallments: 10 } }).payment,
    ).toMatchObject({ maxInstallments: 3, interestFreeInstallments: 3 })
  })

  it("o mapa usa o link e o embed cadastrados em `endereco`", () => {
    expect(toSiteStore(doc).map).toEqual({
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18",
      linkUrl: "https://maps.app.goo.gl/abc",
    })
  })

  it("só as redes preenchidas, na ordem fixa", () => {
    const store = toSiteStore({
      ...doc,
      redesSociais: { ...doc.redesSociais, tiktok: "https://tiktok.com/@loja" },
    })
    expect(store.social.map((link) => link.network)).toEqual(["instagram", "tiktok"])
  })

  it("aceita os nomes do design doc como alternativa", () => {
    const store = toSiteStore({
      nomeFantasia: "Loja",
      whatsapp: "34 91234-5678",
      social: { facebook: "https://facebook.com/loja" },
    })
    expect(store.whatsapp).toBe("5534912345678")
    expect(store.social).toEqual([
      { network: "facebook", label: "Facebook", url: "https://facebook.com/loja" },
    ])
  })

  it("sem WhatsApp, cai no telefone; sem nenhum, no padrão", () => {
    expect(toSiteStore({ telefone: "(34) 3232-1010" }).whatsapp).toBe("553432321010")
    expect(toSiteStore({}).whatsapp).toBe(FALLBACK_STORE.whatsapp)
  })

  it("campo vazio é ausência, não texto", () => {
    const store = toSiteStore({ ...doc, email: "  ", razaoSocial: "" })
    expect(store.email).toBeUndefined()
    expect(store.legalName).toBeUndefined()
  })
})
