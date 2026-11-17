/**
 * CEP e número que o cliente usou para calcular o frete na página do produto: o carrinho
 * começa com eles, para não pedir duas vezes. Só nesta aba (`sessionStorage`), e nada além
 * do que ele mesmo digitou. Armazenamento bloqueado = segue sem lembrar.
 */
const KEY = "smartpoint:frete:v1"

export interface SavedAddress {
  cep: string
  number: string
}

export function saveAddress(address: SavedAddress) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(address))
  } catch {
    // Sem armazenamento (aba anônima, cookies desligados): o carrinho pede de novo.
  }
}

export function readSavedAddress(): SavedAddress | null {
  try {
    const data = JSON.parse(
      window.sessionStorage.getItem(KEY) ?? "null",
    ) as Partial<SavedAddress> | null
    const cep = String(data?.cep ?? "").replace(/\D/g, "")
    const number = String(data?.number ?? "").trim()
    return cep.length === 8 && number ? { cep, number } : null
  } catch {
    return null
  }
}
