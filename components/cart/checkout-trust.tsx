import Image from "next/image"
import { WhatsAppIcon } from "@/components/layout/whatsapp-cta"
import type { StorePhoto } from "@/lib/store-rules"
import { cn } from "@/lib/utils"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

/**
 * O que responde, na hora de pagar, as dúvidas que travam a compra: é seguro pagar? vai
 * chegar? a loja existe? e se der problema? Só afirmações verdadeiras — nada de selo ou
 * garantia que a loja não dá.
 */

function LockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

const CARD_BRANDS = ["Visa", "Mastercard", "Elo", "Hipercard", "American Express"]

/** Pagamento seguro: quem processa (Mercado Pago, do Mercado Livre), quem vê o cartão (só ele). */
export function PaymentSecurity({
  pix,
  card,
  installments,
}: {
  pix: boolean
  card: boolean
  /** "em até 12x", quando a loja parcela. */
  installments?: string
}) {
  return (
    <div className="rounded-md bg-brand-soft p-3 ring-1 ring-brand/30">
      <p className="flex items-center gap-2 font-semibold text-brand-deep">
        <LockIcon />
        Pagamento seguro pelo Mercado Pago
      </p>
      <p className="mt-1.5 text-sm text-ink-soft">
        O pagamento é processado pelo <strong className="text-ink">Mercado Pago</strong>, a empresa
        de pagamentos do <strong className="text-ink">Mercado Livre</strong>. Você digita os dados
        do cartão na página segura dele:{" "}
        <strong className="text-ink">a loja não vê nem guarda</strong> os dados do seu cartão.
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Formas de pagamento">
        {pix && <PaymentChip>Pix · aprovado na hora</PaymentChip>}
        {card && (
          <>
            {CARD_BRANDS.map((brand) => (
              <PaymentChip key={brand}>{brand}</PaymentChip>
            ))}
            {installments && <PaymentChip>{`Cartão ${installments}`}</PaymentChip>}
          </>
        )}
      </ul>
    </div>
  )
}

function PaymentChip({ children }: { children: string }) {
  return (
    <li className="rounded-sm bg-paper px-1.5 py-0.5 text-[11px] font-semibold text-ink ring-1 ring-line">
      {children}
    </li>
  )
}

/** "Depois de pagar": o que acontece, passo a passo — tira o medo de "e agora?". */
export function AfterPayment({ delivering }: { delivering: boolean }) {
  const steps = [
    "O Mercado Pago confirma o pagamento e manda o comprovante para o seu e-mail.",
    delivering
      ? "A loja chama você no WhatsApp para combinar a entrega."
      : "A loja avisa no seu WhatsApp quando o pedido estiver separado para retirar.",
    "Você acompanha tudo na página do pedido, que abre logo depois do pagamento.",
  ]
  return (
    <div>
      <p className="text-sm font-semibold">Depois de pagar</p>
      <ol className="mt-2 space-y-1.5">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-2 text-sm text-ink-soft">
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-brand-ink"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export interface StoreTrustData {
  name: string
  city?: string
  legalName?: string
  cnpj?: string
  address?: string
  photo?: StorePhoto
  /** Nota da loja no Google, quando configurada. */
  rating?: { rating: number; count: number }
}

/** A loja existe: foto, endereço, CNPJ e nota no Google. */
export function StoreTrust({ store }: { store: StoreTrustData }) {
  return (
    <div className="flex items-start gap-3 rounded-md p-3 ring-1 ring-line">
      {store.photo && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-shelf">
          <Image
            src={store.photo.url}
            alt={store.photo.alt ?? "Fachada da loja"}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
      )}
      <div className="min-w-0 space-y-0.5 text-sm">
        <p className="font-semibold">Loja física{store.city ? ` em ${store.city}` : ""}</p>
        {store.address && <p className="text-ink-soft">{store.address}</p>}
        {store.cnpj && (
          <p className="text-xs text-ink-soft">
            {store.legalName ?? store.name} · CNPJ {store.cnpj}
          </p>
        )}
        {store.rating && (
          <p className="text-xs">
            <span aria-hidden="true" className="text-tag">
              ★
            </span>{" "}
            <strong>{store.rating.rating.toLocaleString("pt-BR")}</strong>
            <span className="text-ink-soft"> no Google · {store.rating.count} avaliações</span>
          </p>
        )}
      </div>
    </div>
  )
}

/** "Dúvida antes de pagar?": o caminho para falar com a loja sem perder o carrinho. */
export function CheckoutHelp({ whatsapp, message }: { whatsapp: string; message: string }) {
  return (
    <p className="flex items-center justify-center gap-1.5 text-center text-sm text-ink-soft">
      <WhatsAppIcon className="h-4 w-4 shrink-0 text-zap" />
      <span>
        Dúvida ou problema?{" "}
        <a
          href={buildWhatsAppUrl(whatsapp, message)}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="carrinho_ajuda"
          className="font-semibold text-brand-strong underline"
        >
          Fale com a gente antes de pagar
        </a>
      </span>
    </p>
  )
}

/** Etapas da finalização: mostra que falta pouco. */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Seus dados", "Como receber", "Pagamento"]
  return (
    <ol
      className="flex items-center gap-1.5 text-[11px] whitespace-nowrap"
      aria-label="Etapas da compra"
    >
      {steps.map((label, index) => {
        const step = index + 1
        const done = step < current
        const active = step === current
        return (
          <li key={label} className="flex items-center gap-1.5">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 font-semibold",
                active ? "text-brand-strong" : done ? "text-ink" : "text-ink-soft",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                  active || done ? "bg-brand text-brand-ink" : "bg-shelf ring-1 ring-line",
                )}
              >
                {done ? "✓" : step}
              </span>
              {label}
            </span>
            {step < steps.length && <span aria-hidden="true" className="h-px w-3 bg-line" />}
          </li>
        )
      })}
    </ol>
  )
}

export { LockIcon }
