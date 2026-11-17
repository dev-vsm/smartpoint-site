"use client"

import { track } from "@vercel/analytics"
import { useId, useState } from "react"
import { DeliveryPromiseText } from "@/components/ui/delivery-promise"
import { checkoutErrorMessage } from "@/lib/checkout"
import { saveAddress } from "@/lib/saved-address"
import { cn, formatPrice } from "@/lib/utils"

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; fee: number; district: string; distanceKm: number }
  | { status: "error"; message: string }

const FAILED =
  "Não conseguimos calcular o frete agora. Você pode retirar na loja ou combinar pelo WhatsApp."

/**
 * "Calcule o frete" na página do produto: CEP + número → ViaCEP (rua) → a mesma cotação do
 * carrinho (`/api/delivery-quote`, que pergunta ao admin). Frete conhecido antes de decidir é o
 * que mais segura a compra. Só aparece com a compra online e a entrega ligadas.
 */
export function DeliveryEstimator({ className }: { className?: string }) {
  const id = useId()
  const [cep, setCep] = useState("")
  const [number, setNumber] = useState("")
  const [state, setState] = useState<State>({ status: "idle" })
  const digits = cep.replace(/\D/g, "")
  const ready = digits.length === 8 && number.trim() !== ""

  async function estimate() {
    if (!ready) return
    setState({ status: "loading" })
    try {
      const viacep = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        signal: AbortSignal.timeout(8000),
      })
      const place = (await viacep.json()) as Record<string, string | boolean>
      if (!viacep.ok || place.erro) {
        setState({ status: "error", message: "CEP não encontrado. Confira os números." })
        return
      }
      const response = await fetch("/api/delivery-quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          address: {
            cep: digits,
            street: String(place.logradouro ?? ""),
            number: number.trim(),
            complement: "",
            district: String(place.bairro ?? ""),
            city: String(place.localidade ?? ""),
            state: String(place.uf ?? ""),
          },
        }),
        signal: AbortSignal.timeout(20000),
      })
      const body = (await response.json().catch(() => ({}))) as {
        fee?: number
        district?: string
        distanceMeters?: number
        code?: string
        error?: string
      }
      if (response.ok && typeof body.fee === "number") {
        setState({
          status: "ok",
          fee: body.fee,
          district: body.district || String(place.bairro ?? ""),
          distanceKm: Math.round((body.distanceMeters ?? 0) / 100) / 10,
        })
        track("frete_cotado", { origem: "produto", frete: body.fee })
        saveAddress({ cep: digits, number: number.trim() })
        return
      }
      setState({
        status: "error",
        message: body.code?.startsWith("DELIVERY")
          ? checkoutErrorMessage(body.code, body.error)
          : FAILED,
      })
    } catch {
      setState({ status: "error", message: FAILED })
    }
  }

  return (
    <form
      className={cn("rounded-md bg-shelf p-3 ring-1 ring-line", className)}
      onSubmit={(event) => {
        event.preventDefault()
        void estimate()
      }}
    >
      <p className="text-sm font-semibold">Calcule o frete</p>
      <div className="mt-2 flex gap-2">
        <label htmlFor={`${id}-cep`} className="sr-only">
          CEP
        </label>
        <input
          id={`${id}-cep`}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="CEP"
          value={cep}
          onChange={(event) => setCep(event.target.value)}
          className="min-h-11 w-28 min-w-0 rounded-sm border border-line bg-paper px-3 text-base focus:border-brand-strong focus:outline-2 focus:outline-brand"
        />
        <label htmlFor={`${id}-number`} className="sr-only">
          Número
        </label>
        <input
          id={`${id}-number`}
          placeholder="Nº"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          className="min-h-11 w-16 min-w-0 rounded-sm border border-line bg-paper px-3 text-base focus:border-brand-strong focus:outline-2 focus:outline-brand"
        />
        <button
          type="submit"
          disabled={!ready || state.status === "loading"}
          className="min-h-11 flex-1 rounded-sm border border-brand-strong bg-paper px-3 text-sm font-semibold text-brand-strong hover:bg-brand-soft disabled:opacity-50"
        >
          {state.status === "loading" ? "Calculando…" : "Calcular"}
        </button>
      </div>
      <div aria-live="polite">
        {state.status === "ok" && (
          <div className="mt-2 text-sm">
            <p>
              Frete{state.district ? ` para ${state.district}` : ""}:{" "}
              <strong className="text-ink">{state.fee ? formatPrice(state.fee) : "grátis"}</strong>
              {state.distanceKm > 0 && (
                <span className="text-ink-soft">
                  {" "}
                  · {state.distanceKm.toLocaleString("pt-BR")} km da loja
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-brand-strong">
              <DeliveryPromiseText fallback="" />
            </p>
          </div>
        )}
        {state.status === "error" && (
          <p className="mt-2 text-sm text-tag-strong">{state.message}</p>
        )}
      </div>
    </form>
  )
}
