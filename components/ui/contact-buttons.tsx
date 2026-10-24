import { cn } from "@/lib/utils"

/**
 * Botões de contato com a cara de onde levam (e-mail pelo provedor, telefone),
 * no mesmo formato do `SocialButton` e do `WhatsAppCta`: 44px de altura, ícone
 * à esquerda, o dado em si como texto.
 */
const BASE =
  "inline-flex h-11 min-w-0 items-center gap-2 rounded-sm px-3 text-xs font-bold shadow-sm transition sm:px-4 sm:text-sm"

type MailProvider = "gmail" | "outlook" | "other"

function mailProvider(email: string): MailProvider {
  const domain = email.split("@")[1]?.toLowerCase() ?? ""
  if (domain === "gmail.com" || domain === "googlemail.com") return "gmail"
  if (/^(outlook|hotmail|live|msn)\.(com|com\.br)$/.test(domain)) return "outlook"
  return "other"
}

/** Gmail branco com o "M" colorido; Outlook azul; o resto, envelope no tom do site. */
const MAIL_STYLE: Record<MailProvider, string> = {
  gmail: "bg-white text-[#3c4043] ring-1 ring-line hover:bg-neutral-50",
  outlook: "bg-[#0a66c2] text-white hover:bg-[#0858a8]",
  other: "bg-paper text-brand-strong ring-1 ring-line hover:bg-brand-soft",
}

export function EmailButton({ email, className }: { email: string; className?: string }) {
  const provider = mailProvider(email)
  return (
    <a
      href={`mailto:${email}`}
      aria-label={`Enviar e-mail para ${email}`}
      className={cn(BASE, MAIL_STYLE[provider], className)}
    >
      {provider === "gmail" ? <GmailIcon /> : <MailIcon />}
      <span className="truncate">{email}</span>
    </a>
  )
}

export function PhoneButton({
  label,
  href,
  className,
}: {
  label: string
  href: string
  className?: string
}) {
  return (
    <a
      href={href}
      aria-label={`Ligar para ${label}`}
      className={cn(BASE, "bg-brand-strong text-paper hover:bg-brand-deep", className)}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 shrink-0">
        <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" />
      </svg>
      <span className="truncate">{label}</span>
    </a>
  )
}

function GmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path fill="#4285F4" d="M2 7.2v10.3A1.5 1.5 0 0 0 3.5 19H6.2v-8.6Z" />
      <path fill="#34A853" d="M22 7.2v10.3a1.5 1.5 0 0 1-1.5 1.5h-2.7v-8.6Z" />
      <path fill="#EA4335" d="M6.2 10.4 12 14.7l5.8-4.3V6.6L12 10.9 6.2 6.6Z" />
      <path fill="#C5221F" d="M2 7.2l4.2 3.2V6.6L4.4 5.3A1.5 1.5 0 0 0 2 6.5Z" />
      <path fill="#FBBC04" d="M22 7.2l-4.2 3.2V6.6l1.8-1.3A1.5 1.5 0 0 1 22 6.5Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  )
}
