/**
 * Horário da loja: o admin grava faixas em texto livre ("Segunda a sexta",
 * "Sábado", "Domingo e feriados") e aqui elas viram dias da semana — para o
 * "aberto agora" e para o horário que o Google mostra. Sem dependência de
 * relógio: quem chama passa o momento, o que permite testar.
 */

export interface HoursSlot {
  days: string
  opens: string
  closes: string
}

/** 0 = domingo … 6 = sábado, como `Date.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

const DAY_PREFIXES: Array<[string, Weekday]> = [
  ["dom", 0],
  ["seg", 1],
  ["ter", 2],
  ["qua", 3],
  ["qui", 4],
  ["sex", 5],
  ["sab", 6],
]

const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

function dayOf(word: string): Weekday | undefined {
  return DAY_PREFIXES.find(([prefix]) => word.startsWith(prefix))?.[1]
}

/**
 * "Segunda a sexta" → [1..5]; "Sábado" → [6]; "Segunda, quarta e sexta" →
 * [1, 3, 5]; "Sexta a domingo" → [5, 6, 0]. O que não reconhece fica fora:
 * melhor não prometer um dia do que prometer o errado.
 */
export function parseDays(label: string): Weekday[] {
  const text = normalize(label).replace(/-?feira/g, "")
  if (/todos os dias|diariamente/.test(text)) return [0, 1, 2, 3, 4, 5, 6]

  const days = new Set<Weekday>()
  for (const part of text.split(/,|\se\s/)) {
    const range = part.split(/\s(?:a|ate)\s|-/)
    const words = range.map((piece) => piece.trim().split(/\s+/)[0] ?? "")
    const start = dayOf(words[0] ?? "")
    const end = range.length > 1 ? dayOf(words[words.length - 1] ?? "") : start
    if (start === undefined || end === undefined) continue
    for (let day = start; ; day = ((day + 1) % 7) as Weekday) {
      days.add(day)
      if (day === end) break
    }
  }
  return [...days]
}

function minutes(time: string): number | undefined {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) return undefined
  return Number(match[1]) * 60 + Number(match[2])
}

export type OpenStatus =
  | { open: true; closes: string }
  /** `inDays`: 0 = hoje, 1 = amanhã… */
  | { open: false; next?: { inDays: number; day: Weekday; opens: string } }

/** Aberta agora? Se não, quando abre. `now` é o horário local da loja. */
export function openStatus(hours: HoursSlot[], now: { day: Weekday; minutes: number }): OpenStatus {
  const slots = hours.flatMap((slot) => {
    const opens = minutes(slot.opens)
    const closes = minutes(slot.closes)
    if (opens === undefined || closes === undefined || closes <= opens) return []
    return parseDays(slot.days).map((day) => ({ day, opens, closes, slot }))
  })

  const current = slots.find(
    (slot) => slot.day === now.day && now.minutes >= slot.opens && now.minutes < slot.closes,
  )
  if (current) return { open: true, closes: current.slot.closes }

  for (let inDays = 0; inDays < 7; inDays++) {
    const day = ((now.day + inDays) % 7) as Weekday
    const next = slots
      .filter((slot) => slot.day === day && (inDays > 0 || slot.opens > now.minutes))
      .sort((a, b) => a.opens - b.opens)[0]
    if (next) return { open: false, next: { inDays, day, opens: next.slot.opens } }
  }
  return { open: false }
}

/** "Aberto agora · fecha às 20:00" / "Fechado · abre amanhã às 09:30". */
export function openStatusText(status: OpenStatus): string {
  if (status.open) return `Aberto agora · fecha às ${status.closes}`
  if (!status.next) return "Fechado agora"
  const { inDays, day, opens } = status.next
  const when = inDays === 0 ? "hoje" : inDays === 1 ? "amanhã" : DAY_NAMES[day]
  return `Fechado agora · abre ${when} às ${opens}`
}

/** Dia e minuto atuais no fuso da loja — o visitante pode estar em outro. */
export function storeNow(date: Date, timeZone = "America/Sao_Paulo") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"))
  return {
    day: Math.max(day, 0) as Weekday,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  }
}

/** Antecedência do corte da entrega em relação ao fechamento: a entrega sai até 1 h antes. */
export const DELIVERY_CUTOFF_MINUTES = 60

/**
 * Quando o cliente recebe um produto de pronta entrega, pelo horário da loja:
 * - `today`: dentro do dia e antes do corte da entrega (fechamento − 1 h) — entrega e retirada hoje;
 * - `pickup_today`: passou do corte (ou a loja não entrega) mas a loja ainda abre/está aberta hoje;
 * - `next`: hoje não dá mais; o próximo dia de funcionamento.
 * `null` sem horário cadastrado: melhor não prometer nada.
 */
export type DeliveryPromise =
  | { kind: "today"; orderUntil: string; pickupUntil: string }
  | { kind: "pickup_today"; pickupUntil: string }
  | { kind: "next"; inDays: number; day: Weekday; opens: string }

function clock(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

export function deliveryPromise(
  hours: HoursSlot[],
  now: { day: Weekday; minutes: number },
  { delivers }: { delivers: boolean },
): DeliveryPromise | null {
  const slots = hours.flatMap((slot) => {
    const opens = minutes(slot.opens)
    const closes = minutes(slot.closes)
    if (opens === undefined || closes === undefined || closes <= opens) return []
    return parseDays(slot.days).map((day) => ({ day, opens, closes }))
  })
  if (!slots.length) return null

  const today = slots.filter((slot) => slot.day === now.day)
  const lastClose = Math.max(...today.map((slot) => slot.closes))
  if (today.length && now.minutes < lastClose) {
    const cutoff = lastClose - DELIVERY_CUTOFF_MINUTES
    if (delivers && now.minutes < cutoff) {
      return { kind: "today", orderUntil: clock(cutoff), pickupUntil: clock(lastClose) }
    }
    return { kind: "pickup_today", pickupUntil: clock(lastClose) }
  }

  for (let inDays = 1; inDays <= 7; inDays++) {
    const day = ((now.day + inDays) % 7) as Weekday
    const first = slots.filter((slot) => slot.day === day).sort((a, b) => a.opens - b.opens)[0]
    if (first) return { kind: "next", inDays, day, opens: clock(first.opens) }
  }
  return null
}

/** "20:00" → "20h"; "19:30" → "19h30". */
export function shortTime(time: string): string {
  const [hour, minute] = time.split(":")
  return `${Number(hour)}h${minute === "00" ? "" : minute}`
}

/** "amanhã", "segunda"… para o próximo dia de funcionamento. */
export function dayWord(inDays: number, day: Weekday): string {
  return inDays === 1 ? "amanhã" : DAY_NAMES[day]
}

/** Selo curto do card: a promessa mais forte que ainda é verdade. */
export function promiseBadgeText(promise: DeliveryPromise, delivers: boolean): string {
  if (promise.kind === "today") return "Receba hoje"
  if (promise.kind === "pickup_today") return `Retire hoje até ${shortTime(promise.pickupUntil)}`
  return `${delivers ? "Receba" : "Retire"} ${dayWord(promise.inDays, promise.day)}`
}

/** Frase da página do produto: o prazo de cada forma de receber. */
export function promiseDetailText(promise: DeliveryPromise, delivers: boolean): string {
  const when = promise.kind === "next" ? dayWord(promise.inDays, promise.day) : "hoje"
  if (promise.kind === "today") {
    return delivers
      ? `Peça até ${shortTime(promise.orderUntil)} e receba hoje · ou retire na loja até ${shortTime(promise.pickupUntil)}`
      : `Retire hoje na loja até ${shortTime(promise.pickupUntil)}`
  }
  if (promise.kind === "pickup_today") {
    return `Retire hoje na loja até ${shortTime(promise.pickupUntil)}${delivers ? " · a entrega sai no próximo dia de funcionamento" : ""}`
  }
  return delivers
    ? `Receba ${when} · ou retire na loja ${when} a partir das ${shortTime(promise.opens)}`
    : `Retire na loja ${when} a partir das ${shortTime(promise.opens)}`
}

/** Opção "Retirar na loja" do carrinho: quando dá para retirar. */
export function pickupOptionText(promise: DeliveryPromise): string {
  if (promise.kind === "next") {
    return `Retire ${dayWord(promise.inDays, promise.day)} a partir das ${shortTime(promise.opens)}`
  }
  return `Retire hoje até ${shortTime(promise.pickupUntil)}`
}

/** Opção "Entrega" do carrinho: quando chega, se pagar agora. */
export function deliveryOptionText(promise: DeliveryPromise): string {
  if (promise.kind === "today") return `Receba hoje se pagar até ${shortTime(promise.orderUntil)}`
  if (promise.kind === "next") return `Receba ${dayWord(promise.inDays, promise.day)}`
  return "Entrega no próximo dia de funcionamento"
}
