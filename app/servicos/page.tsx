import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppCta, WhatsAppFloating } from "@/components/layout/whatsapp-cta"
import { JsonLd } from "@/components/seo/json-ld"
import { ButtonLink } from "@/components/ui/button"
import { Container } from "@/components/ui/section"
import { ServiceRow } from "@/components/ui/service-row"
import { serviceJsonLd } from "@/lib/seo"
import { listServices } from "@/lib/site-content"
import { getStore } from "@/lib/store"

export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: "/servicos" },
  title: "Consertos de celular em Uberlândia",
  description:
    "Troca de tela, bateria, dock de carga, tampa e botões. Diagnóstico na hora, orçamento antes de mexer no aparelho e conserto no quiosque da Av. João Pinheiro.",
}

/** O que convence quem está com o celular quebrado na mão. */
const REASONS = [
  {
    title: "Você vê o orçamento antes",
    text: "A gente abre o aparelho, mostra o que tem e só começa depois do seu sim. Sem surpresa no fim.",
  },
  {
    title: "Conserto no balcão, não em outra cidade",
    text: "O aparelho fica aqui na Av. João Pinheiro. Nada de mandar para fora e esperar semana.",
  },
  {
    title: "Peça testada na sua frente",
    text: "Antes de fechar, a gente liga o aparelho e testa toque, câmera, som e carga com você olhando.",
  },
  {
    title: "Garantia no serviço",
    text: "Deu problema no que a gente trocou? Você volta e resolve, sem discussão.",
  },
]

const STEPS = [
  { title: "Traz o aparelho", text: "Passe no quiosque ou mande a mensagem contando o que houve." },
  {
    title: "Diagnóstico e preço",
    text: "Olhamos na hora e falamos o valor e o prazo antes de mexer.",
  },
  {
    title: "Conserta e testa",
    text: "Trocamos a peça, testamos junto com você e você leva de volta.",
  },
]

const FAQ = [
  {
    q: "Quanto tempo demora?",
    a: "Troca de tela, bateria e dock costumam sair no mesmo dia. Se a peça precisar ser pedida, a gente avisa o prazo antes de você decidir.",
  },
  {
    q: "Preciso agendar?",
    a: "Não. O quiosque é de rua: chegou, é atendido. Mandar mensagem antes só ajuda a já separar a peça.",
  },
  {
    q: "E se não tiver conserto?",
    a: "Você leva o aparelho de volta e não paga o diagnóstico. A gente só cobra o que conserta.",
  },
  {
    q: "Quanto custa?",
    a: "Depende do modelo e da peça. Por isso o preço sai na conversa, depois de ver o aparelho — falar um valor no escuro seria chute.",
  },
]

export default async function ServicesPage() {
  const [store, services] = await Promise.all([getStore(), listServices()])
  const city = store.cityLine || "Uberlândia, MG"

  return (
    <>
      <JsonLd data={serviceJsonLd(services, store)} />
      <Header storeName={store.name} logoUrl={store.brand.logoUrl} whatsapp={store.whatsapp} />

      <main>
        {/* Hero: a promessa concreta, não slogan. */}
        <section className="bg-ink py-14 text-paper">
          <Container className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl">Seu celular resolvido hoje, no balcão</h1>
            <p className="mt-4 max-w-prose text-lg text-paper/80">
              Tela trincada, bateria que não segura, aparelho que não carrega. A gente olha na hora,
              fala o preço antes de mexer e conserta com você acompanhando — no quiosque da{" "}
              {store.addressLine || "Av. João Pinheiro"}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <WhatsAppCta
                number={store.whatsapp}
                label="Contar meu problema"
                message="Olá! Meu celular está com problema e quero um orçamento."
                className="w-auto"
              />
              <ButtonLink
                href="/servicos/orcamento"
                variant="outline"
                className="w-auto border-paper/30 bg-transparent text-paper hover:border-paper"
              >
                Pedir orçamento pelo formulário
              </ButtonLink>
            </div>
          </Container>
        </section>

        {/* O que consertamos */}
        <section className="py-12">
          <Container>
            <h2 className="text-2xl">O que a gente conserta</h2>
            <p className="mt-1 max-w-prose text-sm text-ink-soft">
              Os reparos do dia a dia. Se o seu não está na lista, pergunte — a maioria a gente
              resolve.
            </p>
            <ul className="mt-5 rounded-md bg-paper px-5 ring-1 ring-line">
              {services.map((service) => (
                <ServiceRow key={service.title} service={service} whatsapp={store.whatsapp} />
              ))}
            </ul>
          </Container>
        </section>

        {/* Por que aqui */}
        <section className="bg-paper py-12">
          <Container>
            <h2 className="text-2xl">Por que deixar com a gente</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {REASONS.map((reason) => (
                <li key={reason.title} className="border-l-2 border-tag pl-4">
                  <h3 className="text-lg">{reason.title}</h3>
                  <p className="mt-1 max-w-prose text-sm text-ink-soft">{reason.text}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Como funciona — sequência de verdade, por isso numerada */}
        <section className="py-12">
          <Container>
            <h2 className="text-2xl">Como funciona</h2>
            <ol className="mt-6 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="display flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-paper">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-lg">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{step.text}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Dúvidas */}
        <section className="bg-paper py-12">
          <Container>
            <h2 className="text-2xl">Antes de decidir</h2>
            <dl className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
              {FAQ.map((item) => (
                <div key={item.q} className="py-4">
                  <dt className="font-semibold">{item.q}</dt>
                  <dd className="mt-1 max-w-prose text-sm text-ink-soft">{item.a}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* Fechamento */}
        <section className="py-12">
          <Container className="max-w-3xl">
            <h2 className="text-2xl">Manda a mensagem que a gente já responde</h2>
            <p className="mt-2 max-w-prose text-ink-soft">
              Diga o modelo do aparelho e o que aconteceu. Em {city}, atendimento no balcão e pelo
              WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <WhatsAppCta
                number={store.whatsapp}
                label="Falar agora no WhatsApp"
                message="Olá! Meu celular está com problema e quero um orçamento."
                className="w-auto"
              />
              <Link
                href="/servicos/orcamento"
                className="inline-flex min-h-11 items-center text-sm font-semibold underline"
              >
                Prefiro preencher o formulário
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <Footer
        store={{
          name: store.name,
          logoUrl: store.brand.logoUrl,
          addressLine: store.addressLine,
          cityLine: store.cityLine,
          hours: store.hours,
          instagram: store.instagram,
          cnpj: store.cnpj,
        }}
      />
      <WhatsAppFloating number={store.whatsapp} />
    </>
  )
}
