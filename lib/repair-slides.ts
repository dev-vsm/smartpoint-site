import type { SiteStore } from "@/lib/store-rules"

/** Campanhas aprovadas para assistência: sem preços ou prazos presumidos. */
export interface RepairSlide {
  id: string
  label: string
  title: string
  description: string
  benefit?: string
  cta: string
  message: string
  /** Foto de fundo do slide. */
  image?: string
  /** Logo da loja no lugar da foto (slide de apresentação). */
  logo?: { url: string; alt: string }
}

export const REPAIR_SLIDES: RepairSlide[] = [
  {
    id: "assistencia",
    label: "Assistência técnica",
    title: "Seu celular em boas mãos.",
    description:
      "Troca de tela, bateria, conectores e tampa traseira. Conte o problema e converse com a nossa equipe.",
    benefit: "Garantia de 90 dias",
    cta: "Pedir orçamento pelo WhatsApp",
    message: "Olá! Gostaria de um orçamento de assistência técnica para meu celular.",
    image: "/banners/carousel/assistencia.png",
  },
  {
    id: "tela",
    label: "Troca de tela",
    title: "Tela quebrada? Vamos resolver.",
    description:
      "Informe o modelo do seu celular e consulte o orçamento para trocar a tela. Serviço com garantia de 90 dias.",
    benefit: "Película de brinde na troca de tela",
    cta: "Consultar troca de tela",
    message:
      "Olá! Quero um orçamento de troca de tela com película de brinde. Vou informar o modelo do meu celular.",
    image: "/banners/carousel/tela.png",
  },
  {
    id: "bateria",
    label: "Troca de bateria",
    title: "A bateria não acompanha seu dia?",
    description:
      "Descarrega rápido ou desliga sozinha? Conte os sintomas e peça um orçamento para o seu aparelho.",
    benefit: "Garantia de 90 dias",
    cta: "Consultar troca de bateria",
    message:
      "Olá! Meu celular está com problemas na bateria. Gostaria de consultar a troca e informar o modelo.",
    image: "/banners/carousel/bateria.png",
  },
  {
    id: "conector",
    label: "Conector de carga e fone",
    title: "Mau contato? Fale com quem resolve.",
    description:
      "Problemas para carregar ou conectar o fone? Consulte a troca do conector e tire suas dúvidas com a equipe.",
    benefit: "Garantia de 90 dias",
    cta: "Consultar reparo do conector",
    message: "Olá! Gostaria de um orçamento para o conector de carga ou de fone do meu celular.",
    image: "/banners/carousel/conector.png",
  },
  {
    id: "entrega",
    label: "Entrega em Uberlândia",
    title: "Frete grátis acima de R$ 150",
    description: "Consulte a disponibilidade para o seu endereço.",
    cta: "Consultar entrega",
    message: "Olá! Quero consultar a entrega grátis em Uberlândia para uma compra acima de R$ 150.",
    image: "/banners/carousel/entrega-uberlandia.png",
  },
]

/**
 * Slide de apresentação da loja, o primeiro do carrossel: a logo e o texto
 * "Sobre" de `settings/store` (editados no admin em /loja). Sem logo, não há slide.
 */
export function storeSlide(store: SiteStore): RepairSlide | undefined {
  const logoUrl = store.brand.logoUrl
  if (!logoUrl) return undefined
  const about = store.about?.replace(/\s+/g, " ").trim()
  return {
    id: "loja",
    label: store.city ? `Acessórios para celular em ${store.city}` : "Acessórios para celular",
    title: `Conheça a ${store.name}`,
    description: about
      ? about.charAt(0).toUpperCase() + about.slice(1)
      : "Capinhas, películas, fones, carregadores e eletrônicos com preço na etiqueta.",
    benefit: store.district ? `Loja física no ${store.district}` : undefined,
    cta: "Falar com a loja",
    message: "Olá! Vim pelo site e quero conhecer os produtos da loja.",
    logo: { url: logoUrl, alt: store.name },
  }
}

/** Carrossel completo: a loja primeiro, depois as campanhas. */
export function bannerSlides(store: SiteStore): RepairSlide[] {
  const intro = storeSlide(store)
  return intro ? [intro, ...REPAIR_SLIDES] : REPAIR_SLIDES
}
