import { describe, expect, it } from "vitest"
import {
  deliveryPromise,
  type HoursSlot,
  promiseBadgeText,
  promiseDetailText,
  shortTime,
  type Weekday,
} from "@/lib/hours"

/** Seg–sex 9h30–20h, sábado 9h–14h e 15h–19h30 (com pausa), domingo fechado. */
const hours: HoursSlot[] = [
  { days: "Segunda a sexta", opens: "09:30", closes: "20:00" },
  { days: "Sábado", opens: "09:00", closes: "14:00" },
  { days: "Sábado", opens: "15:00", closes: "19:30" },
]
const at = (day: Weekday, time: string) => {
  const [h, m] = time.split(":").map(Number)
  return { day, minutes: h * 60 + m }
}
const badge = (day: Weekday, time: string, delivers = true) => {
  const promise = deliveryPromise(hours, at(day, time), { delivers })
  return promise && promiseBadgeText(promise, delivers)
}

describe("prazo de pronta entrega", () => {
  it("antes do corte (1 h antes de fechar), inclusive antes de abrir: receba hoje", () => {
    expect(badge(2, "07:00")).toBe("Receba hoje")
    expect(badge(2, "12:00")).toBe("Receba hoje")
    expect(badge(2, "18:59")).toBe("Receba hoje")
    expect(deliveryPromise(hours, at(2, "10:00"), { delivers: true })).toEqual({
      kind: "today",
      orderUntil: "19:00",
      pickupUntil: "20:00",
    })
  })

  it("entre o corte e o fechamento: só a retirada ainda vale hoje", () => {
    expect(badge(2, "19:00")).toBe("Retire hoje até 20h")
    expect(badge(2, "19:59")).toBe("Retire hoje até 20h")
  })

  it("depois de fechar: o próximo dia de funcionamento", () => {
    expect(badge(2, "20:00")).toBe("Receba amanhã")
    expect(badge(6, "19:30")).toBe("Receba segunda")
    expect(badge(0, "10:00")).toBe("Receba amanhã")
  })

  it("dia com pausa usa o último fechamento", () => {
    expect(badge(6, "14:30")).toBe("Receba hoje")
    expect(badge(6, "18:45")).toBe("Retire hoje até 19h30")
  })

  it("loja que não entrega: só retirada, sem corte", () => {
    expect(badge(2, "12:00", false)).toBe("Retire hoje até 20h")
    expect(badge(2, "21:00", false)).toBe("Retire amanhã")
  })

  it("sem horário cadastrado não promete nada", () => {
    expect(deliveryPromise([], at(2, "12:00"), { delivers: true })).toBeNull()
    expect(
      deliveryPromise([{ days: "Feriados", opens: "09:00", closes: "18:00" }], at(2, "12:00"), {
        delivers: true,
      }),
    ).toBeNull()
  })

  it("frase da página do produto com o prazo de cada forma de receber", () => {
    const text = (day: Weekday, time: string, delivers = true) => {
      const promise = deliveryPromise(hours, at(day, time), { delivers })
      return promise && promiseDetailText(promise, delivers)
    }
    expect(text(2, "10:00")).toBe("Peça até 19h e receba hoje · ou retire na loja até 20h")
    expect(text(2, "19:10")).toBe(
      "Retire hoje na loja até 20h · a entrega sai no próximo dia de funcionamento",
    )
    expect(text(6, "20:00")).toBe("Receba segunda · ou retire na loja segunda a partir das 9h30")
    expect(text(2, "10:00", false)).toBe("Retire hoje na loja até 20h")
    expect(text(5, "21:00", false)).toBe("Retire na loja amanhã a partir das 9h")
    expect(shortTime("09:05")).toBe("9h05")
  })
})
