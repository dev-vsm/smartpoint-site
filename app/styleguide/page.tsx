import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { Button } from "@/components/ui/button"
import { PriceTag } from "@/components/ui/price-tag"
import { ProductCard } from "@/components/ui/product-card"
import { Container, SectionHeading } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"

// Página de referência do design system. Fora do índice: é ferramenta de trabalho.
export const metadata: Metadata = { robots: { index: false, follow: false } }

const WHATSAPP = "5534998349528"

const PRODUCTS = [
  {
    slug: "capa-iphone-15",
    name: "Capa anti-impacto iPhone 15",
    priceFromCents: 7990,
    hasVariants: true,
    category: "Capinhas",
  },
  {
    slug: "pelicula-3d",
    name: "Película 3D de vidro com aplicação",
    priceFromCents: 3500,
    hasVariants: false,
    category: "Películas",
  },
  {
    slug: "fone-bluetooth",
    name: "Fone Bluetooth com estojo de carga",
    priceFromCents: 12900,
    hasVariants: true,
    category: "Áudio",
  },
  {
    slug: "carregador-turbo",
    name: "Carregador turbo 20W USB-C",
    priceFromCents: 8900,
    hasVariants: false,
    category: "Carregadores",
  },
]

export default function Styleguide() {
  return (
    <>
      <Header storeName="SmartPoint" whatsapp={WHATSAPP} />
      <main className="py-10">
        <Container className="space-y-12">
          <section>
            <SectionHeading
              title="Cores"
              description="Ciano nas ações, laranja nos destaques e tons claros nos fundos. Verde reservado ao WhatsApp."
            />
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Ciano · marca", "bg-brand", "#06B6D4"],
                ["Ciano escuro · links", "bg-brand-strong", "#0E7490"],
                ["Ciano profundo", "bg-brand-deep", "#155E75"],
                ["Ciano suave", "bg-brand-soft", "#E6F9FC"],
                ["Laranja · destaques", "bg-tag", "#F97316"],
                ["Laranja escuro", "bg-tag-strong", "#C2410C"],
                ["Laranja suave", "bg-tag-soft", "#FFF3E8"],
                ["Texto principal", "bg-ink", "#083344"],
                ["Texto secundário", "bg-ink-soft", "#476573"],
                ["Fundo", "bg-shelf", "#F2F9FB"],
                ["Bordas", "bg-line", "#CCE3E9"],
                ["WhatsApp", "bg-zap", "#25D366"],
              ].map(([name, background, hex]) => (
                <li key={name} className="overflow-hidden rounded-md ring-1 ring-line">
                  <div className={`${background} h-16`} />
                  <div className="bg-paper p-2 text-xs">
                    <p className="font-semibold">{name}</p>
                    <p className="mt-1 font-mono text-ink-soft">{hex}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading
              title="Tipografia"
              description="Archivo em dois extremos do eixo de largura: 700 expandido nos títulos, 400 no texto."
            />
            <div className="space-y-3 rounded-md bg-paper p-5 ring-1 ring-line">
              <h1 className="text-4xl">Capinha nova, película colocada na hora</h1>
              <h2 className="text-2xl">Película colocada no balcão</h2>
              <h3 className="text-lg">Capa anti-impacto</h3>
              <p className="max-w-prose text-sm text-ink-soft">
                Texto corrido em Archivo 400, com no máximo 80 caracteres por linha para leitura
                confortável no celular, que é onde quase todo mundo vai abrir este site.
              </p>
            </div>
          </section>

          <section>
            <SectionHeading
              title="Etiqueta de preço"
              description="O elemento gráfico da vitrine."
            />
            <div className="flex flex-wrap items-end gap-4 rounded-md bg-paper p-5 ring-1 ring-line">
              <PriceTag cents={3500} size="sm" />
              <PriceTag cents={7990} />
              <PriceTag cents={12900} from size="lg" />
              <PriceTag cents={4990} align="right" />
            </div>
          </section>

          <section>
            <SectionHeading title="Botões" />
            <div className="flex flex-wrap items-center gap-3 rounded-md bg-paper p-5 ring-1 ring-line">
              <Button>Ver produtos</Button>
              <Button variant="outline">Filtrar</Button>
              <Button variant="ghost">Limpar</Button>
              <WhatsAppCta number={WHATSAPP} className="w-auto" />
            </div>
          </section>

          <section>
            <SectionHeading
              title="Vitrine"
              description="Duas colunas no celular, quatro no desktop."
            />
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {PRODUCTS.map((product) => (
                <li key={product.slug}>
                  <ProductCard product={product} whatsapp={WHATSAPP} />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading title="Carregando" description="Enquanto a vitrine chega." />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="rounded-md bg-paper p-3 ring-1 ring-line">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="mt-3 h-3 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
              ))}
            </div>
          </section>
        </Container>
      </main>
      <Footer
        store={{
          name: "SmartPoint",
          addressLine: "Av. João Pinheiro, 337",
          cityLine: "Uberlândia, MG",
          hours: [
            { days: "Segunda a sexta", opens: "09:00", closes: "18:00" },
            { days: "Sábado", opens: "09:00", closes: "13:00" },
          ],
          instagram: "https://www.instagram.com/udiasmartpoint/",
          cnpj: "59.237.018/0001-54",
        }}
      />
    </>
  )
}
