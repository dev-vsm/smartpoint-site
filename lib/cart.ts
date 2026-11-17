/**
 * Carrinho do site — regras puras (sem navegador). O estado vive no `localStorage`
 * (`lib/cart-store.ts`); preço, estoque e taxa são conferidos de novo no admin na hora
 * de pagar, então o que fica aqui é só a lembrança do que o cliente escolheu.
 */
export interface CartItem {
  productId: string
  slug: string
  name: string
  /** Preço que o cliente viu (centavos). O admin recusa se o cadastro mudou. */
  priceCents: number
  /** Capa do produto (URL pronta), para a lista do carrinho. */
  image?: string
  /** O que tranquiliza na hora de pagar: "Garantia de 90 dias · Galaxy S24". */
  note?: string
  quantity: number
  /** Estoque quando foi adicionado: limita o "+" (o admin confere o real). */
  maxQuantity: number
}

/** Teto por produto, igual ao do admin. */
export const MAX_QUANTITY = 20
/** Produtos diferentes no carrinho, igual ao do admin. */
export const MAX_ITEMS = 30

const clamp = (value: number, max: number) =>
  Math.max(1, Math.min(Math.trunc(value), max, MAX_QUANTITY))

export function addItem(
  cart: CartItem[],
  item: Omit<CartItem, "quantity">,
  quantity = 1,
): CartItem[] {
  const current = cart.find((entry) => entry.productId === item.productId)
  if (current) {
    return cart.map((entry) =>
      entry.productId === item.productId
        ? { ...entry, ...item, quantity: clamp(entry.quantity + quantity, item.maxQuantity) }
        : entry,
    )
  }
  if (cart.length >= MAX_ITEMS || item.maxQuantity < 1) return cart
  return [...cart, { ...item, quantity: clamp(quantity, item.maxQuantity) }]
}

export function setQuantity(cart: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity < 1) return removeItem(cart, productId)
  return cart.map((entry) =>
    entry.productId === productId
      ? { ...entry, quantity: clamp(quantity, entry.maxQuantity) }
      : entry,
  )
}

export function removeItem(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((entry) => entry.productId !== productId)
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((total, entry) => total + entry.quantity, 0)
}

export function cartSubtotal(cart: CartItem[]): number {
  return cart.reduce((total, entry) => total + entry.priceCents * entry.quantity, 0)
}

/** Lê o que estava guardado; qualquer coisa estranha (versão antiga, edição à mão) é descartada. */
export function parseCart(raw: string | null): CartItem[] {
  if (!raw) return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  return data
    .flatMap((value): CartItem[] => {
      const item = value as Partial<CartItem>
      const valid =
        typeof item?.productId === "string" &&
        typeof item.slug === "string" &&
        typeof item.name === "string" &&
        Number.isInteger(item.priceCents) &&
        (item.priceCents ?? 0) > 0 &&
        Number.isFinite(item.quantity) &&
        Number.isFinite(item.maxQuantity) &&
        (item.maxQuantity ?? 0) >= 1
      if (!valid) return []
      const max = Math.trunc(item.maxQuantity as number)
      return [
        {
          productId: item.productId as string,
          slug: item.slug as string,
          name: item.name as string,
          priceCents: item.priceCents as number,
          ...(typeof item.image === "string" ? { image: item.image } : {}),
          ...(typeof item.note === "string" && item.note.trim()
            ? { note: item.note.trim().slice(0, 120) }
            : {}),
          maxQuantity: max,
          quantity: clamp(item.quantity as number, max),
        },
      ]
    })
    .slice(0, MAX_ITEMS)
}
