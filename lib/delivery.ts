/**
 * Retirada e faixas de entrega (`settings/store.delivery`, editado em /loja/site no admin).
 *
 * O frete é pela distância da rota de carro da loja até o endereço, medida pelo admin no
 * Google Maps (`POST /api/delivery-quote` → admin). Aqui só se lê a configuração para saber
 * se há entrega e mostrar o resumo das faixas; o valor cobrado vem sempre do admin.
 */
export interface DeliveryRange {
  /** Limite da faixa, em km. */
  upToKm: number
  /** Centavos. */
  fee: number
}

export interface StoreDelivery {
  pickup: boolean
  /** Em ordem crescente de distância. Vazio = sem entrega pelo site. */
  ranges: DeliveryRange[]
}

export const DEFAULT_DELIVERY: StoreDelivery = { pickup: true, ranges: [] }

type Doc = Record<string, unknown>
const record = (value: unknown): Doc =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Doc) : {}

export function toDelivery(value: unknown): StoreDelivery {
  const data = record(value)
  const ranges = Array.isArray(data.ranges)
    ? data.ranges.flatMap((item) => {
        const range = record(item)
        const upToKm = Number(range.upToKm)
        const fee = Math.trunc(Number(range.fee))
        return Number.isFinite(upToKm) && upToKm > 0 && Number.isFinite(fee) && fee >= 0
          ? [{ upToKm, fee }]
          : []
      })
    : []
  return {
    pickup: data.pickup !== false,
    ranges: ranges.sort((a, b) => a.upToKm - b.upToKm),
  }
}

/** A loja entrega pelo site? */
export function deliversAnywhere(delivery: StoreDelivery): boolean {
  return delivery.ranges.length > 0
}

/** 4.25 → "4,3"; 6 → "6". */
export function formatKm(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 })
}

/** Resumo para a opção de entrega: "até 8 km da loja". */
export function deliveryReach(delivery: StoreDelivery): string {
  const max = delivery.ranges.at(-1)?.upToKm
  return max ? `até ${formatKm(max)} km da loja` : ""
}
