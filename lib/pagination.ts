/**
 * Paginação numerada, feita no servidor: cada página é uma URL própria
 * (`?pagina=2`), compartilhável e indexável, e o navegador recebe só os itens
 * daquela página.
 */

export interface Page<T> {
  items: T[]
  page: number
  totalPages: number
  totalItems: number
  /** Posição (1-based) do primeiro e do último item exibidos. */
  from: number
  to: number
}

/**
 * Lê `?pagina=`. Ausente é a página 1; qualquer coisa que não seja um inteiro
 * positivo escrito "limpo" (`2`, não `02` nem `2.0`) é inválida e vira `null`,
 * para a rota responder 404 em vez de duplicar conteúdo em URLs diferentes.
 */
export function parsePage(raw: string | string[] | undefined): number | null {
  if (raw === undefined) return 1
  if (Array.isArray(raw) || !/^[1-9]\d{0,5}$/.test(raw)) return null
  return Number(raw)
}

/** Fatia a lista. Página além da última devolve `null`, exceto lista vazia. */
export function paginate<T>(items: T[], page: number, perPage: number): Page<T> | null {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  if (page > totalPages) return null

  const start = (page - 1) * perPage
  const slice = items.slice(start, start + perPage)
  return {
    items: slice,
    page,
    totalPages,
    totalItems,
    from: totalItems ? start + 1 : 0,
    to: start + slice.length,
  }
}

/**
 * Números a mostrar: sempre a primeira e a última, a atual e `siblings` de cada
 * lado; o resto vira reticências. Quantidade estável de casas, para os botões
 * não pularem de lugar enquanto a pessoa navega.
 *
 *   pageWindow(1, 20)  → [1, 2, 3, 4, 5, "…", 20]
 *   pageWindow(10, 20) → [1, "…", 9, 10, 11, "…", 20]
 */
export function pageWindow(page: number, totalPages: number, siblings = 1): Array<number | "…"> {
  // primeira + última + atual + vizinhos + duas reticências
  const slots = 2 * siblings + 5
  if (totalPages <= slots) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const left = Math.max(page - siblings, 2)
  const right = Math.min(page + siblings, totalPages - 1)
  const showLeftGap = left > 3
  const showRightGap = right < totalPages - 2

  if (!showLeftGap) {
    const count = slots - 2
    return [...Array.from({ length: count }, (_, i) => i + 1), "…", totalPages]
  }
  if (!showRightGap) {
    const count = slots - 2
    return [1, "…", ...Array.from({ length: count }, (_, i) => totalPages - count + 1 + i)]
  }
  return [1, "…", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "…", totalPages]
}
