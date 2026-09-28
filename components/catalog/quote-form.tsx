"use client"

import { track } from "@vercel/analytics"
import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { quoteMessage } from "@/lib/messages"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

const schema = z.object({
  device: z.string().trim().min(2, "Diga a marca e o modelo do aparelho."),
  service: z.string().trim().min(2, "Escolha o que precisa."),
  problem: z.string().trim().max(600).optional(),
  name: z.string().trim().max(80).optional(),
})

/**
 * Orçamento sem backend (decisão D7): o formulário organiza o que o atendimento
 * precisa saber e abre o WhatsApp com a mensagem pronta. Nada é enviado nem
 * gravado — o histórico é a conversa.
 */
export function QuoteForm({ services, whatsapp }: { services: string[]; whatsapp: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const parsed = schema.safeParse({
      device: form.get("device"),
      service: form.get("service"),
      problem: form.get("problem"),
      name: form.get("name"),
    })

    if (!parsed.success) {
      const found: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0])
        found[field] ??= issue.message
      }
      setErrors(found)
      return
    }

    setErrors({})
    track("orcamento_whatsapp", { servico: parsed.data.service })
    window.open(buildWhatsAppUrl(whatsapp, quoteMessage(parsed.data)), "_blank", "noopener")
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
