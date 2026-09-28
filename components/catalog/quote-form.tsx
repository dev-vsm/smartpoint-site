"use client"

import { track } from "@vercel/analytics"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { quoteMessage } from "@/lib/messages"
import { type QuoteErrors, validateQuote } from "@/lib/quote-validation"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

/**
 * Orçamento sem backend (decisão D7): o formulário organiza o que o atendimento
 * precisa saber e abre o WhatsApp com a mensagem pronta. Nada é enviado nem
 * gravado — o histórico é a conversa.
 */
export function QuoteForm({ services, whatsapp }: { services: string[]; whatsapp: string }) {
  const [errors, setErrors] = useState<QuoteErrors>({})

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const { data, errors: found } = validateQuote({
      device: form.get("device"),
      service: form.get("service"),
      problem: form.get("problem"),
      name: form.get("name"),
    })

    setErrors(found)
    if (!data) return

    track("orcamento_whatsapp", { servico: data.service })
    window.open(buildWhatsAppUrl(whatsapp, quoteMessage(data)), "_blank", "noopener")
  }

  return (
    <form onSubmit={submit} noValidate className="grid max-w-xl gap-4">
      <Field label="Qual é o aparelho?" htmlFor="device" hint="Marca e modelo, como está na caixa.">
        <Input id="device" name="device" placeholder="iPhone 13, Moto G54…" />
        <FieldError message={errors.device} />
      </Field>

      <Field label="O que precisa?" htmlFor="service">
        <Select id="service" name="service" defaultValue={services[0]}>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
          <option value="Outro reparo">Outro reparo</option>
        </Select>
        <FieldError message={errors.service} />
      </Field>

      <Field
        label="Conte o que está acontecendo"
        htmlFor="problem"
        hint="Opcional, mas ajuda a já responder com o preço."
      >
        <Textarea id="problem" name="problem" placeholder="Caiu e a tela trincou no canto." />
      </Field>

      <Field label="Seu nome" htmlFor="name" hint="Opcional.">
        <Input id="name" name="name" placeholder="Como quer ser chamado" />
      </Field>

      <Button type="submit" variant="whatsapp" className="w-full sm:w-auto">
        Abrir o WhatsApp com esse pedido
      </Button>
      <p className="text-xs text-ink-soft">
        O pedido abre direto na conversa — se tiver foto do aparelho, mande por lá que ajuda no
        orçamento.
      </p>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs font-semibold text-tag">
      {message}
    </p>
  )
}
