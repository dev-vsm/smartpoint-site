import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Footer } from "@/components/layout/footer"
import { PageShell } from "@/components/layout/page-shell"
import { SectionHeading } from "@/components/ui/section"
import { getStore } from "@/lib/store"
import { catalogSubmenu } from "@/lib/submenu"
import { formatPhone } from "@/lib/utils"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

export const revalidate = 86400

export const metadata: Metadata = {
  alternates: { canonical: "/privacidade" },
  title: "Privacidade",
  description: "Como a SmartPoint trata os dados de quem usa o site e compra pela loja online.",
}

/** Prazo de guarda dos dados do cliente nos pedidos (o admin anonimiza depois dele). */
const RETENTION_YEARS = 5

/**
 * Política de privacidade (LGPD, art. 9º): quem trata, o quê, para quê, com que base, com quem
 * compartilha, por quanto tempo e como exercer os direitos. Dados da loja vêm de
 * `settings/store`; nada de nome ou CNPJ escrito no código.
 */
export default async function PrivacyPage() {
  const [store, submenu] = await Promise.all([getStore(), catalogSubmenu()])
  const controller = [store.legalName ?? store.name, store.cnpj ? `CNPJ ${store.cnpj}` : null]
    .filter(Boolean)
    .join(", ")
  const address = [store.addressLine, store.cityLine].filter(Boolean).join(" — ")
  const whatsappUrl = buildWhatsAppUrl(
    store.whatsapp,
    "Olá! Quero tratar dos meus dados pessoais (LGPD).",
  )

  return (
    <>
      <PageShell submenu={submenu} className="py-8">
        <SectionHeading title="Privacidade" />
        <div className="max-w-prose space-y-6 text-sm text-ink-soft">
          <Section title="Quem cuida dos seus dados">
            <p>
              A responsável pelos dados tratados neste site é {controller}
              {store.name !== (store.legalName ?? store.name) ? ` (${store.name})` : ""}
              {address ? `, ${address}` : ""}. Para qualquer assunto sobre os seus dados, fale com a
              gente pelo{" "}
              <a href={whatsappUrl} className="font-semibold text-brand-strong underline">
                WhatsApp {formatPhone(store.whatsapp)}
              </a>
              {store.email ? (
                <>
                  {" "}
                  ou pelo e-mail{" "}
                  <a
                    href={`mailto:${store.email}`}
                    className="font-semibold text-brand-strong underline"
                  >
                    {store.email}
                  </a>
                </>
              ) : null}
              . Esse é o nosso canal de atendimento ao titular.
            </p>
          </Section>

          <Section title="Navegar pelo site">
            <p>
              Para ver produtos você não precisa se cadastrar, e o site não usa cookie de
              rastreamento nem de publicidade. Medimos audiência com o Vercel Analytics, que conta
              visitas e desempenho das páginas de forma agregada, sem cookie e sem identificar quem
              visitou. O carrinho fica guardado só no seu navegador e some quando você limpa os
              dados do site ou conclui a compra.
            </p>
          </Section>

          <Section title="Comprar pelo site">
            <p>Ao finalizar uma compra, tratamos:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="text-ink">nome, WhatsApp e e-mail</strong>, para registrar o
                pedido, enviar o comprovante e falar com você sobre ele;
              </li>
              <li>
                <strong className="text-ink">endereço</strong>, quando você escolhe a entrega, para
                calcular o frete e entregar;
              </li>
              <li>
                os <strong className="text-ink">produtos, valores e a situação do pagamento</strong>
                , para separar o pedido e cumprir obrigações fiscais.
              </li>
            </ul>
            <p>
              A base legal é a <strong className="text-ink">execução do contrato de compra</strong>{" "}
              (LGPD, art. 7º, V) e, para guardar os registros da venda, o{" "}
              <strong className="text-ink">cumprimento de obrigação legal</strong> (art. 7º, II).
              Não usamos esses dados para publicidade e não os vendemos.
            </p>
          </Section>

          <Section title="Com quem compartilhamos">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="text-ink">Mercado Pago</strong>: o pagamento acontece na página
                dele. Cartão e Pix vão direto para o Mercado Pago e nunca passam por aqui; enviamos
                nome, e-mail e o valor da compra.
              </li>
              <li>
                <strong className="text-ink">Google Maps</strong>: o endereço de entrega é enviado
                só para medir a distância da loja e calcular o frete.
              </li>
              <li>
                <strong className="text-ink">ViaCEP</strong>: o CEP digitado é consultado para
                preencher o endereço.
              </li>
              <li>
                <strong className="text-ink">Google Cloud (Firebase) e Vercel</strong>: onde o
                sistema da loja e o site funcionam e os pedidos ficam guardados.
              </li>
              <li>
                <strong className="text-ink">WhatsApp</strong>: se você escolher conversar por lá,
                valem os termos do WhatsApp, e o que você enviar fica na conversa, usado só para
                atender o seu pedido.
              </li>
            </ul>
            <p>
              Alguns desses serviços podem processar dados fora do Brasil (transferência
              internacional, LGPD art. 33), sempre por meio de empresas que oferecem garantias de
              proteção em contrato.
            </p>
          </Section>

          <Section title="Por quanto tempo guardamos">
            <p>
              Os dados do pedido ficam guardados por {RETENTION_YEARS} anos a partir da compra, o
              prazo das obrigações fiscais e de eventuais reclamações sobre a compra. Depois disso,
              nome, WhatsApp, e-mail e endereço são apagados do pedido, e fica só o registro da
              venda (produtos, valores e data), sem identificar você.
            </p>
          </Section>

          <Section title="Seus direitos">
            <p>
              Você pode pedir, a qualquer momento: confirmação de que tratamos seus dados, acesso a
              eles, correção, anonimização ou eliminação do que não for mais necessário,
              portabilidade, informação sobre com quem compartilhamos e revisão desta política
              (LGPD, art. 18). Basta falar com a gente pelo canal acima; respondemos em até 15 dias.
              Dados que a lei nos obriga a manter (como o registro fiscal da venda) ficam guardados
              até o fim do prazo. Você também pode reclamar à Autoridade Nacional de Proteção de
              Dados (ANPD).
            </p>
          </Section>

          <Section title="Segurança">
            <p>
              O site usa conexão segura (HTTPS), o pagamento é feito no ambiente do Mercado Pago e o
              acesso ao sistema da loja é restrito à equipe. Se acontecer algum incidente que possa
              causar risco a você, avisaremos e comunicaremos a ANPD, como a lei exige.
            </p>
          </Section>
        </div>
      </PageShell>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {children}
    </section>
  )
}
