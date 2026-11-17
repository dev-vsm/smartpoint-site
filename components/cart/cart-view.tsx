"use client"

import { track } from "@vercel/analytics"
import Image from "next/image"
import Link from "next/link"
import { type ReactNode, useEffect, useRef, useState } from "react"
import {
  AfterPayment,
  CheckoutHelp,
  CheckoutSteps,
  LockIcon,
  PaymentSecurity,
  StoreTrust,
  type StoreTrustData,
} from "@/components/cart/checkout-trust"
import { WhatsAppCta } from "@/components/layout/whatsapp-cta"
import { Button } from "@/components/ui/button"
import { FulfillmentPromise } from "@/components/ui/delivery-promise"
import { cartSubtotal } from "@/lib/cart"
import { cartActions, useCart } from "@/lib/cart-store"
import {
  buildCheckout,
  type CheckoutForm,
  checkoutErrorMessage,
  EMPTY_ADDRESS,
  type FieldErrors,
  isCartError,
  newOrderId,
  quotableAddress,
} from "@/lib/checkout"
import { deliversAnywhere, deliveryReach, formatKm, type StoreDelivery } from "@/lib/delivery"
import { readSavedAddress } from "@/lib/saved-address"
import { cn, formatPrice } from "@/lib/utils"

/** Falhas de conexão: a próxima tentativa usa o mesmo pedido (o admin não duplica). */
const RETRY_SAME_ORDER = new Set(["REQUEST_TIMEOUT", "NETWORK_ERROR"])

type CepState = { status: "idle" | "loading" | "found" } | { status: "error"; message: string }

/** Frete do endereço atual, calculado no admin (`key` = endereço consultado). */
type QuoteState =
  | { status: "idle" }
  | { status: "loading"; key: string }
  | { status: "ok"; key: string; fee: number; label: string; distanceMeters: number }
  | { status: "error"; key: string; message: string }

/** Espera o cliente parar de digitar antes de consultar o frete. */
const QUOTE_DEBOUNCE_MS = 600
const QUOTE_TIMEOUT_MS = 20000
const QUOTE_FAILED_MESSAGE =
  "Não conseguimos calcular o frete agora. Escolha a retirada na loja ou fale com a loja pelo WhatsApp."

/**
 * Carrinho + finalização: itens, contato, retirada ou entrega e o botão que leva ao Mercado
 * Pago. O frete vem do admin (rota de carro no Google Maps + faixas de km) assim que CEP,
 * rua e número estão preenchidos; sem frete calculado, a entrega não fecha online.
 */
export function CartView({
  delivery,
  storeCity,
  pickupAddress,
  whatsapp,
  installments,
  checkoutEnabled,
  store,
  pix = false,
  card = false,
}: {
  delivery: StoreDelivery
  storeCity?: string
  /** Endereço da loja, para a opção de retirada. */
  pickupAddress?: string
  whatsapp: string
  /** "em até 6x", quando a loja parcela. */
  installments?: string
  /** Sem a configuração do admin, a compra segue pelo WhatsApp. */
  checkoutEnabled: boolean
  /** Loja física, CNPJ e nota no Google: a prova de que a loja existe. */
  store: StoreTrustData
  /** Formas aceitas no Mercado Pago (chips do bloco de pagamento seguro). */
  pix?: boolean
  card?: boolean
}) {
  const cart = useCart()
  const canPickup = delivery.pickup
  const canDeliver = deliversAnywhere(delivery)
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    phone: "",
    email: "",
    fulfillment: canPickup ? "pickup" : "delivery",
    address: EMPTY_ADDRESS,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [cep, setCep] = useState<CepState>({ status: "idle" })
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const pendingOrder = useRef<string | null>(null)

  const [quote, setQuote] = useState<QuoteState>({ status: "idle" })
  const [quoteNonce, setQuoteNonce] = useState(0)

  const subtotal = cartSubtotal(cart)
  const delivering = form.fulfillment === "delivery"
  const target = delivering ? quotableAddress(form.address) : null
  // O complemento não muda o frete: fica fora da chave para não consultar de novo.
  const quoteKey = target ? JSON.stringify({ ...target, complement: "" }) : ""
  const current = quote.status !== "idle" && quote.key === quoteKey ? quote : null
  const quoted = current?.status === "ok" ? current : null
  const fee = quoted ? quoted.fee : 0
  const blockedByAddress = delivering && target !== null && !quoted

  // `quoteNonce` na chave força nova consulta depois de o admin avisar que o frete mudou.
  const requestKey = quoteKey && `${quoteNonce}|${quoteKey}`
  useEffect(() => {
    if (!requestKey) return
    const key = requestKey.slice(requestKey.indexOf("|") + 1)
    const address = JSON.parse(key) as unknown
    const controller = new AbortController()
    let timedOut = false
    let timeout: number | undefined
    const timer = window.setTimeout(async () => {
      setQuote({ status: "loading", key })
      timeout = window.setTimeout(() => {
        timedOut = true
        controller.abort()
      }, QUOTE_TIMEOUT_MS)
      try {
        const response = await fetch("/api/delivery-quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ address }),
          signal: controller.signal,
        })
        const body = (await response.json().catch(() => ({}))) as {
          fee?: unknown
          label?: unknown
          distanceMeters?: unknown
          district?: unknown
          code?: string
          error?: string
        }
        if (response.ok && typeof body.fee === "number") {
          track("frete_cotado", { origem: "carrinho", frete: body.fee })
          setQuote({
            status: "ok",
            key,
            fee: body.fee,
            label: String(body.label ?? ""),
            distanceMeters: Number(body.distanceMeters) || 0,
          })
          // Bairro do CEP, quando o cliente ainda não preencheu.
          if (typeof body.district === "string" && body.district) {
            const district = body.district
            setForm((form) =>
              form.address.district ? form : { ...form, address: { ...form.address, district } },
            )
          }
        } else {
          // Recusa do frete (longe, endereço não achado…) tem mensagem própria; o resto
          // (admin fora do ar, conexão) é "frete indisponível", não erro de pagamento.
          setQuote({
            status: "error",
            key,
            message: body.code?.startsWith("DELIVERY")
              ? checkoutErrorMessage(body.code, body.error)
              : QUOTE_FAILED_MESSAGE,
          })
        }
      } catch {
        // Endereço mudou no meio (abort sem tempo esgotado): a consulta nova assume.
        if (controller.signal.aborted && !timedOut) return
        setQuote({ status: "error", key, message: QUOTE_FAILED_MESSAGE })
      } finally {
        window.clearTimeout(timeout)
      }
    }, QUOTE_DEBOUNCE_MS)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [requestKey])

  const update = (patch: Partial<CheckoutForm>) => setForm((current) => ({ ...current, ...patch }))
  const updateAddress = (patch: Partial<CheckoutForm["address"]>) =>
    setForm((current) => ({ ...current, address: { ...current.address, ...patch } }))

  async function lookupCep(value: string) {
    const digits = value.replace(/\D/g, "")
    if (digits.length !== 8) return
    setCep({ status: "loading" })
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        signal: AbortSignal.timeout(8000),
      })
      const data = (await response.json()) as Record<string, string | boolean>
      if (!response.ok || data.erro) {
        setCep({ status: "error", message: "CEP não encontrado. Confira os números." })
        return
      }
      setForm((current) => ({
        ...current,
        address: {
          ...current.address,
          street: current.address.street || String(data.logradouro ?? ""),
          district: String(data.bairro ?? "") || current.address.district,
          city: String(data.localidade ?? ""),
          state: String(data.uf ?? ""),
        },
      }))
      setCep({ status: "found" })
    } catch {
      // Sem resposta do serviço de CEP: o cliente digita bairro e cidade, e o admin confere.
      setCep({
        status: "error",
        message: "Não conseguimos buscar o CEP agora. Preencha bairro e cidade.",
      })
    }
  }

  // Entrega escolhida e endereço vazio: começa com o CEP e o número do frete calculado na
  // página do produto (e já busca a rua), para o cliente não digitar duas vezes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: só ao escolher a entrega.
  useEffect(() => {
    if (!delivering || form.address.cep) return
    const saved = readSavedAddress()
    if (!saved) return
    updateAddress({ cep: saved.cep, number: saved.number })
    void lookupCep(saved.cep)
  }, [delivering])

  async function submit() {
    setFailure(null)
    const built = buildCheckout(cart, form, quoted?.fee)
    if (!built.ok) {
      setErrors(built.errors)
      return
    }
    setErrors({})
    setSubmitting(true)
    const orderId = pendingOrder.current ?? newOrderId()
    pendingOrder.current = orderId
    let code: string | undefined
    let message: string | undefined
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, payload: built.payload }),
        signal: AbortSignal.timeout(40000),
      })
      const body = (await response.json().catch(() => ({}))) as {
        payUrl?: string
        code?: string
        error?: string
      }
      if (response.ok && body.payUrl) {
        track("checkout_iniciado", {
          itens: cart.length,
          total: subtotal + fee,
          entrega: form.fulfillment,
        })
        window.location.assign(body.payUrl)
        return
      }
      code = body.code
      message = body.error
    } catch {
      code = "NETWORK_ERROR"
    }
    if (!code || !RETRY_SAME_ORDER.has(code)) pendingOrder.current = null
    // Frete mudou desde a prévia (ou o cálculo falhou): consulta de novo para mostrar o valor certo.
    if (delivering && (code?.startsWith("DELIVERY") || code === "PRICE_CHANGED"))
      setQuoteNonce((n) => n + 1)
    setFailure(
      code === "NETWORK_ERROR" || code === "REQUEST_TIMEOUT"
        ? "Sem resposta do servidor. Confira a internet e tente de novo — você não será cobrado duas vezes."
        : checkoutErrorMessage(code, message),
    )
    if (isCartError(code)) window.scrollTo({ top: 0, behavior: "smooth" })
    setSubmitting(false)
  }

  if (!cart.length) {
    return (
      <div className="rounded-md bg-paper p-8 text-center ring-1 ring-line">
        <p className="text-lg font-semibold">Seu carrinho está vazio.</p>
        <p className="mt-1 text-sm text-ink-soft">
          Escolha os produtos com pronta entrega e finalize por aqui.
        </p>
        <Link
          href="/produtos"
          className="mt-2 inline-flex min-h-11 items-center font-semibold text-brand-strong underline"
        >
          Ver produtos
        </Link>
      </div>
    )
  }

  const whatsappMessage = [
    "Olá! Quero comprar:",
    ...cart.map(
      (item) =>
        `• ${item.quantity}x ${item.name} — ${formatPrice(item.priceCents * item.quantity)}`,
    ),
    `Total: ${formatPrice(subtotal)}`,
    ...(delivering && target
      ? [
          `Entrega: ${target.street}, ${target.number}${target.complement ? ` - ${target.complement}` : ""}${target.district ? `, ${target.district}` : ""} (CEP ${target.cep})`,
        ]
      : []),
  ].join("\n")

  const helpMessage = [
    "Olá! Tenho uma dúvida antes de pagar o meu pedido:",
    ...whatsappMessage.split("\n").slice(1),
  ].join("\n")
  const dataFilled = Boolean(form.name.trim() && form.phone.trim() && form.email.trim())
  const step: 1 | 2 | 3 = !dataFilled ? 1 : delivering && !quoted ? 2 : 3

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <section aria-labelledby="cart-items" className="min-w-0">
        <h2 id="cart-items" className="sr-only">
          Itens do carrinho
        </h2>
        <ul className="divide-y divide-line rounded-md bg-paper ring-1 ring-line">
          {cart.map((item) => (
            <li key={item.productId} className="flex gap-3 p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-paper ring-1 ring-line sm:h-20 sm:w-20">
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 80px, 64px"
                    className="object-contain p-1"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/produtos/${item.slug}`}
                  className="line-clamp-2 text-sm font-semibold hover:underline"
                >
                  {item.name}
                </Link>
                {item.note && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-brand-strong">
                    <span aria-hidden="true">✓</span>
                    {item.note}
                  </p>
                )}
                <p className="mt-0.5 text-sm text-ink-soft">{formatPrice(item.priceCents)} cada</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <QuantityButton
                    label={`Tirar um: ${item.name}`}
                    onClick={() => cartActions.setQuantity(item.productId, item.quantity - 1)}
                  >
                    −
                  </QuantityButton>
                  <span
                    className="w-6 text-center text-sm font-semibold tabular-nums"
                    aria-live="polite"
                  >
                    {item.quantity}
                  </span>
                  <QuantityButton
                    label={`Mais um: ${item.name}`}
                    disabled={item.quantity >= item.maxQuantity}
                    onClick={() => cartActions.setQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </QuantityButton>
                  <button
                    type="button"
                    onClick={() => cartActions.remove(item.productId)}
                    className="min-h-11 px-1 text-sm text-ink-soft underline hover:text-ink"
                  >
                    Remover
                  </button>
                  <p className="ml-auto shrink-0 text-sm font-bold">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {/* Desktop: a coluna dos itens tem espaço — o "depois de pagar" e a loja ficam aqui,
            à vista ao lado do formulário. No celular, eles vêm junto do pagamento. */}
        {checkoutEnabled && (canPickup || canDeliver) && (
          <div className="mt-6 hidden gap-4 lg:grid lg:grid-cols-2">
            <AfterPayment delivering={delivering} />
            <StoreTrust store={store} />
          </div>
        )}
      </section>

      <section
        aria-labelledby="checkout-title"
        className="min-w-0 rounded-md bg-paper p-4 ring-1 ring-line sm:p-5"
      >
        <h2 id="checkout-title" className="text-lg">
          Finalizar compra
        </h2>
        {checkoutEnabled && (canPickup || canDeliver) && (
          <div className="mt-2">
            <CheckoutSteps current={step} />
          </div>
        )}

        {!checkoutEnabled || (!canPickup && !canDeliver) ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-ink-soft">
              A compra online está pausada. Mande o carrinho para a loja:
            </p>
            <WhatsAppCta
              number={whatsapp}
              message={whatsappMessage}
              label="Comprar pelo WhatsApp"
              source="carrinho"
              className="w-full!"
            />
          </div>
        ) : (
          <form
            id="checkout-form"
            className="mt-4 space-y-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
          >
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Seus dados</legend>
              <Field id="name" label="Nome e sobrenome" error={errors.name}>
                <input
                  id="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className={INPUT}
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>
              <Field id="phone" label="WhatsApp com DDD" error={errors.phone}>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(34) 99999-9999"
                  value={form.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  className={INPUT}
                  aria-invalid={Boolean(errors.phone)}
                />
              </Field>
              <Field
                id="email"
                label="E-mail (o comprovante do pagamento vai para ele)"
                error={errors.email}
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className={INPUT}
                  aria-invalid={Boolean(errors.email)}
                />
              </Field>
              <p className="text-xs text-ink-soft">
                Usamos seus dados só para este pedido.{" "}
                <Link href="/privacidade" className="underline hover:text-ink">
                  Privacidade
                </Link>
              </p>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Como quer receber</legend>
              {canPickup && (
                <Choice
                  checked={form.fulfillment === "pickup"}
                  onChange={() => update({ fulfillment: "pickup" })}
                  title="Retirar na loja"
                  detail={pickupAddress ? `Grátis · ${pickupAddress}` : "Grátis"}
                  promise={<FulfillmentPromise kind="pickup" />}
                />
              )}
              {canDeliver && (
                <Choice
                  checked={delivering}
                  onChange={() => update({ fulfillment: "delivery" })}
                  title={`Entrega${storeCity ? ` em ${storeCity}` : ""}`}
                  detail={`Frete pela distância${deliveryReach(delivery) ? ` · ${deliveryReach(delivery)}` : ""}`}
                  promise={<FulfillmentPromise kind="delivery" />}
                />
              )}
            </fieldset>

            {delivering && (
              <fieldset className="space-y-3">
                <legend className="sr-only">Endereço de entrega</legend>
                <Field
                  id="cep"
                  label="CEP"
                  error={errors.cep ?? (cep.status === "error" ? cep.message : undefined)}
                >
                  <input
                    id="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="38400-000"
                    value={form.address.cep}
                    onChange={(e) => {
                      updateAddress({ cep: e.target.value })
                      void lookupCep(e.target.value)
                    }}
                    className={INPUT}
                    aria-invalid={Boolean(errors.cep)}
                  />
                </Field>
                {cep.status === "loading" && (
                  <p className="text-xs text-ink-soft">Buscando o endereço…</p>
                )}
                <Field id="street" label="Rua" error={errors.street}>
                  <input
                    id="street"
                    autoComplete="address-line1"
                    value={form.address.street}
                    onChange={(e) => updateAddress({ street: e.target.value })}
                    className={INPUT}
                    aria-invalid={Boolean(errors.street)}
                  />
                </Field>
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
                  <Field id="number" label="Número" error={errors.number}>
                    <input
                      id="number"
                      value={form.address.number}
                      onChange={(e) => updateAddress({ number: e.target.value })}
                      className={INPUT}
                      aria-invalid={Boolean(errors.number)}
                    />
                  </Field>
                  <Field id="complement" label="Complemento">
                    <input
                      id="complement"
                      autoComplete="address-line2"
                      value={form.address.complement}
                      onChange={(e) => updateAddress({ complement: e.target.value })}
                      className={INPUT}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <Field id="district" label="Bairro">
                    <input
                      id="district"
                      value={form.address.district}
                      onChange={(e) => updateAddress({ district: e.target.value })}
                      className={INPUT}
                    />
                  </Field>
                  <Field id="city" label="Cidade">
                    <input
                      id="city"
                      autoComplete="address-level2"
                      value={form.address.city}
                      onChange={(e) => updateAddress({ city: e.target.value })}
                      className={INPUT}
                    />
                  </Field>
                </div>
                <DeliveryStatus
                  quote={target ? current : null}
                  district={form.address.district}
                  canPickup={canPickup}
                  onPickup={() => update({ fulfillment: "pickup" })}
                  whatsapp={whatsapp}
                  whatsappMessage={whatsappMessage}
                />
              </fieldset>
            )}

            <dl className="space-y-1 border-t border-line pt-4 text-sm">
              <Row label="Produtos" value={formatPrice(subtotal)} />
              {delivering && (
                <Row label="Entrega" value={quoted ? (fee ? formatPrice(fee) : "Grátis") : "—"} />
              )}
              <Row label="Total" value={formatPrice(subtotal + fee)} strong />
            </dl>

            {failure && (
              <p role="alert" className="rounded-sm bg-tag-soft px-3 py-2 text-sm text-tag-strong">
                {failure}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting || blockedByAddress}>
              <LockIcon className="h-4 w-4" />
              {submitting
                ? "Abrindo o Mercado Pago…"
                : `Pagar ${formatPrice(subtotal + fee)} com segurança`}
            </Button>
            <p className="text-center text-xs text-ink-soft">
              Reservamos o seu pedido por 30 minutos enquanto você paga.
            </p>
            <PaymentSecurity pix={pix} card={card} installments={installments} />
            <div className="space-y-4 lg:hidden">
              <AfterPayment delivering={delivering} />
              <StoreTrust store={store} />
            </div>
            <CheckoutHelp whatsapp={whatsapp} message={helpMessage} />
          </form>
        )}
      </section>

      {checkoutEnabled && (canPickup || canDeliver) && (
        <>
          {/* Celular: o total e o pagamento sempre à mão, sem rolar até o fim do formulário. */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="shrink-0">
              <p className="text-xs text-ink-soft">Total</p>
              <p className="font-bold">{formatPrice(subtotal + fee)}</p>
            </div>
            <Button
              type="submit"
              form="checkout-form"
              className="flex-1"
              disabled={submitting || blockedByAddress}
            >
              <LockIcon className="h-4 w-4" />
              {submitting ? "Abrindo…" : "Pagar com segurança"}
            </Button>
          </div>
          <div aria-hidden="true" className="h-20 lg:hidden" />
        </>
      )}
    </div>
  )
}

/** Situação do frete sob o endereço: calculando, valor da faixa ou o que fazer sem ele. */
function DeliveryStatus({
  quote,
  district,
  canPickup,
  onPickup,
  whatsapp,
  whatsappMessage,
}: {
  quote: Exclude<QuoteState, { status: "idle" }> | null
  district: string
  canPickup: boolean
  onPickup: () => void
  whatsapp: string
  whatsappMessage: string
}) {
  if (!quote) {
    return <p className="text-xs text-ink-soft">Informe CEP, rua e número para calcular o frete.</p>
  }
  if (quote.status === "loading") {
    return (
      <p role="status" className="text-sm text-ink-soft">
        Calculando o frete…
      </p>
    )
  }
  if (quote.status === "ok") {
    return (
      <p role="status" className="rounded-sm bg-brand-soft px-3 py-2 text-sm text-ink">
        Frete{district ? ` para ${district}` : ""}:{" "}
        <strong>{quote.fee ? formatPrice(quote.fee) : "grátis"}</strong>
        <span className="block text-xs text-ink-soft">
          {formatKm(quote.distanceMeters / 1000)} km da loja
          {quote.label ? ` · faixa ${quote.label}` : ""}
        </span>
      </p>
    )
  }
  return (
    <div
      role="alert"
      className="space-y-2 rounded-sm bg-tag-soft px-3 py-2 text-sm text-tag-strong"
    >
      <p>{quote.message}</p>
      <div className="flex flex-wrap gap-2">
        {canPickup && (
          <button
            type="button"
            onClick={onPickup}
            className="min-h-11 rounded-sm border border-brand-strong bg-paper px-3 text-sm font-semibold text-brand-strong hover:bg-brand-soft"
          >
            Retirar na loja
          </button>
        )}
        <WhatsAppCta
          number={whatsapp}
          message={whatsappMessage}
          label="Combinar pelo WhatsApp"
          source="carrinho_frete"
        />
      </div>
    </div>
  )
}

const INPUT =
  "min-h-11 w-full rounded-sm border border-line bg-paper px-3 text-base focus:border-brand-strong focus:outline-2 focus:outline-brand aria-invalid:border-tag-strong"

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-tag-strong" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

function Choice({
  checked,
  onChange,
  title,
  detail,
  promise,
}: {
  checked: boolean
  onChange: () => void
  title: string
  detail: string
  /** Quando dá para receber nesta opção ("Retire hoje até 20h"). */
  promise?: ReactNode
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-sm p-3 ring-1 focus-within:ring-2 focus-within:ring-brand",
        checked ? "bg-brand-soft ring-brand-strong" : "ring-line",
      )}
    >
      <input
        type="radio"
        name="fulfillment"
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-ink-soft">{detail}</span>
        {promise}
      </span>
    </label>
  )
}

function QuantityButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-lg font-bold text-brand-strong ring-1 ring-line hover:bg-brand-soft disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between", strong && "text-base font-bold")}>
      <dt className={strong ? undefined : "text-ink-soft"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
