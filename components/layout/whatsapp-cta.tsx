import { ButtonLink } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

/**
 * O único caminho de conversão do site. Recebe a mensagem já contextualizada
 * (produto, serviço) para o atendimento começar sabendo do que se trata.
 */
export function WhatsAppCta({
  number,
  message,
  label = "Falar no WhatsApp",
  className,
}: {
  number: string
  message?: string
  label?: string
  className?: string
}) {
  return (
    <ButtonLink
      variant="whatsapp"
      href={buildWhatsAppUrl(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("w-full sm:w-auto", className)}
    >
      <WhatsAppIcon />
      {label}
    </ButtonLink>
  )
}

/** Botão fixo no canto, presente em todas as páginas no celular. */
export function WhatsAppFloating({ number, message }: { number: string; message?: string }) {
  return (
    <a
      href={buildWhatsAppUrl(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zap text-zap-ink shadow-lg shadow-ink/20 transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.1c-.25.69-1.45 1.32-2 1.36-.51.04-1.16.06-1.87-.12-.43-.11-.99-.32-1.7-.63-3-1.3-4.96-4.32-5.11-4.52-.15-.2-1.22-1.63-1.22-3.11s.77-2.21 1.05-2.51c.27-.3.6-.38.8-.38.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.08.93 2.23.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.39-.45.53-.15.15-.3.31-.13.61.17.3.77 1.27 1.65 2.06 1.14 1.01 2.09 1.33 2.39 1.48.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.75.83 2.05.98.3.15.5.22.57.35.07.13.07.74-.18 1.43Z" />
    </svg>
  )
}
