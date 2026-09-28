import { WhatsAppCta } from "@/components/layout/whatsapp-cta"

export interface ServiceItem {
  title: string
  description?: string
}

/**
 * Serviço é linha de quadro, não card: é o cardápio do técnico. Preço e prazo
 * saem na conversa (decisão D7), então cada linha leva direto ao WhatsApp.
 */
export function ServiceRow({ service, whatsapp }: { service: ServiceItem; whatsapp: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4 last:border-b-0">
      <div className="min-w-0">
        <h3 className="text-lg">{service.title}</h3>
        {service.description && (
          <p className="mt-0.5 text-sm text-ink-soft">{service.description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm text-ink-soft">preço na conversa</span>
        <WhatsAppCta
          number={whatsapp}
          label="Pedir orçamento"
          message={`Olá! Quero um orçamento de ${service.title.toLowerCase()}.`}
          className="w-auto"
        />
      </div>
    </li>
  )
}
