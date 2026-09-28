import { WhatsAppCta } from "@/components/layout/whatsapp-cta"

export interface ServiceItem {
  title: string
  description?: string
}

/**
 * Card do serviço: título, o sintoma que o cliente reconhece e o botão que abre
 * a conversa já dizendo qual reparo é. Preço sai na conversa (decisão D7).
 */
export function ServiceCard({ service, whatsapp }: { service: ServiceItem; whatsapp: string }) {
  return (
    <li className="flex h-full flex-col rounded-md bg-paper p-5 ring-1 ring-line transition-shadow hover:shadow-md">
      <h3 className="text-lg">{service.title}</h3>
      {service.description && <p className="mt-2 text-sm text-ink-soft">{service.description}</p>}
      <p className="mt-4 text-sm text-ink-soft">
        Preço e prazo <strong className="font-semibold text-ink">na conversa</strong>, depois de ver
        o aparelho.
      </p>
      <div className="mt-4 pt-1">
        <WhatsAppCta
          number={whatsapp}
          label="Pedir orçamento"
          message={`Olá! Quero um orçamento de ${service.title.toLowerCase()}.`}
        />
      </div>
    </li>
  )
}
