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
