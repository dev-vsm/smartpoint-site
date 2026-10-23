import { describe, expect, it } from "vitest"
import { openStatus, openStatusText, parseDays, storeNow } from "@/lib/hours"

const HOURS = [
  { days: "Segunda a sexta", opens: "09:30", closes: "20:00" },
  { days: "Sábado", opens: "09:00", closes: "19:30" },
]

const at = (day: number, time: string) => {
  const [hour, minute] = time.split(":").map(Number)
  return { day: day as 0, minutes: hour * 60 + minute }
}

describe("parseDays", () => {
  it("entende faixa, dia solto, lista e o '-feira'", () => {
    expect(parseDays("Segunda a sexta")).toEqual([1, 2, 3, 4, 5])
    expect(parseDays("Sábado")).toEqual([6])
    expect(parseDays("Segunda, quarta e sexta")).toEqual([1, 3, 5])
    expect(parseDays("Segunda-feira a sexta-feira")).toEqual([1, 2, 3, 4, 5])
    expect(parseDays("Sexta a domingo")).toEqual([5, 6, 0])
    expect(parseDays("Todos os dias")).toHaveLength(7)
  })

  it("o que não reconhece fica fora", () => {
    expect(parseDays("Feriados")).toEqual([])
    expect(parseDays("Domingo e feriados")).toEqual([0])
  })
})

describe("openStatus", () => {
  it("aberta: diz quando fecha", () => {
    expect(openStatus(HOURS, at(3, "10:00"))).toEqual({ open: true, closes: "20:00" })
    expect(openStatusText(openStatus(HOURS, at(6, "19:29")))).toBe("Aberto agora · fecha às 19:30")
  })

  it("fechada: diz quando abre — hoje, amanhã ou no dia", () => {
    expect(openStatusText(openStatus(HOURS, at(2, "08:00")))).toBe(
      "Fechado agora · abre hoje às 09:30",
    )
    expect(openStatusText(openStatus(HOURS, at(5, "20:00")))).toBe(
      "Fechado agora · abre amanhã às 09:00",
    )
    expect(openStatusText(openStatus(HOURS, at(6, "20:00")))).toBe(
      "Fechado agora · abre segunda às 09:30",
    )
  })

  it("sem horário cadastrado, só fechado", () => {
    expect(openStatusText(openStatus([], at(1, "10:00")))).toBe("Fechado agora")
  })
})

describe("storeNow", () => {
  it("usa o fuso da loja, não o do visitante", () => {
    // 23/10/2026 01:30 UTC = quinta 22:30 em São Paulo (UTC-3).
    expect(storeNow(new Date("2026-10-23T01:30:00Z"))).toEqual({ day: 4, minutes: 22 * 60 + 30 })
  })
})
