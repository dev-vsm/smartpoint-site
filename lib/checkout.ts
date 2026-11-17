import type { CartItem } from "@/lib/cart"

/**
 * Checkout do site — regras puras. O pedido nasce no admin (`POST /api/site/checkout`), que
 * confere preço, estoque e taxa; aqui só se valida o formulário e se traduz a resposta.
 */

/** Id do pedido: 20 letras e números, o formato que o admin aceita (e a chave de repetição). */
export const ORDER_ID_PATTERN = /^[A-Za-z0-9]{20}$/
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

export function newOrderId(
  random: (size: number) => Uint8Array = (size) => crypto.getRandomValues(new Uint8Array(size)),
): string {
  let id = ""
  while (id.length < 20) {
    for (const byte of random(20)) {
      // 248 = maior múltiplo de 62 abaixo de 256: descarta o resto para não viesar.
      if (byte < 248 && id.length < 20) id += ALPHABET[byte % ALPHABET.length]
    }
  }
  return id
}

export interface CheckoutAddress {
  cep: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
}

export interface CheckoutForm {
  name: string
  phone: string
  email: string
  fulfillment: "pickup" | "delivery"
  address: CheckoutAddress
}

export const EMPTY_ADDRESS: CheckoutAddress = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
}

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
  customer: { name: string; phone: string; email: string }
  fulfillment:
    | { type: "pickup" }
    | {
        type: "delivery"
        address: CheckoutAddress
        /** Frete que o cliente viu; o admin recalcula e avisa se mudou. */
        expectedFee?: number
      }
}

export type FieldErrors = Partial<
  Record<"name" | "phone" | "email" | "cep" | "street" | "number" | "items", string>
>

const digits = (value: string) => value.replace(/\D/g, "")

/** Formulário → corpo do pedido, ou os erros por campo (mensagem para mostrar embaixo dele). */
export function buildCheckout(
  cart: CartItem[],
  form: CheckoutForm,
  expectedFee?: number,
): { ok: true; payload: CheckoutPayload } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {}
  const name = form.name.trim().replace(/\s+/g, " ")
  const phone = digits(form.phone)
  const email = form.email.trim().toLowerCase()
  if (!cart.length) errors.items = "Seu carrinho está vazio."
  if (name.length < 3 || !name.includes(" ")) errors.name = "Informe nome e sobrenome."
  if (!/^(55)?\d{10,11}$/.test(phone)) errors.phone = "Informe o WhatsApp com DDD."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido."

  const address = {
    cep: digits(form.address.cep),
    street: form.address.street.trim(),
    number: form.address.number.trim(),
    complement: form.address.complement.trim(),
    district: form.address.district.trim(),
    city: form.address.city.trim(),
    state: form.address.state.trim().toUpperCase().slice(0, 2),
  }
  if (form.fulfillment === "delivery") {
    if (address.cep.length !== 8) errors.cep = "Informe o CEP com 8 números."
    if (!address.street) errors.street = "Informe a rua."
    if (!address.number) errors.number = "Informe o número (ou s/n)."
  }
  if (Object.keys(errors).length) return { ok: false, errors }

  return {
    ok: true,
    payload: {
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.priceCents,
      })),
      customer: { name, phone, email },
      fulfillment:
        form.fulfillment === "delivery"
          ? { type: "delivery", address, ...(expectedFee === undefined ? {} : { expectedFee }) }
          : { type: "pickup" },
    },
  }
}

/**
 * Código de erro do admin → o que dizer ao cliente. Quando o admin manda uma mensagem
 * própria de negócio (produto, preço, bairro), ela é mais precisa e vale mais.
 */
const SPECIFIC = new Set([
  "PRODUCT_UNAVAILABLE",
  "PRICE_CHANGED",
  "STOCK_INSUFFICIENT",
  "DELIVERY_UNAVAILABLE",
  "DELIVERY_ADDRESS_NOT_FOUND",
  "DELIVERY_QUOTE_FAILED",
])
export const CHECKOUT_FALLBACK_MESSAGE =
  "Não foi possível iniciar o pagamento. Nada foi cobrado. Tente de novo ou fale com a loja pelo WhatsApp."

export function checkoutErrorMessage(
  code: string | undefined,
  message: string | undefined,
): string {
  if (code && SPECIFIC.has(code) && message) return message
  switch (code) {
    case "STOCK_INSUFFICIENT":
      return "Não temos estoque suficiente de um produto. Ajuste a quantidade."
    case "PRODUCT_UNAVAILABLE":
      return "Um produto do carrinho não está mais à venda. Remova e tente de novo."
    case "PRICE_CHANGED":
      return "O preço de um produto mudou. Confira o carrinho e finalize de novo."
    case "DELIVERY_UNAVAILABLE":
      return "Não entregamos nesse endereço. Escolha a retirada na loja."
    case "DELIVERY_ADDRESS_NOT_FOUND":
      return "Não encontramos o endereço no mapa. Confira a rua e o número ou escolha a retirada na loja."
    case "DELIVERY_QUOTE_FAILED":
      return "Não conseguimos calcular o frete agora. Escolha a retirada na loja ou fale com a loja pelo WhatsApp."
    case "MP_UNAVAILABLE":
    case "MP_TIMEOUT":
    case "MP_REJECTED":
      return "O Mercado Pago não respondeu. Nada foi cobrado. Tente de novo em instantes."
    case "INVALID_REQUEST":
      return "Confira os dados do formulário e tente de novo."
    default:
      return CHECKOUT_FALLBACK_MESSAGE
  }
}

/** Endereço pronto para calcular o frete (CEP completo, rua e número). */
export function quotableAddress(address: CheckoutAddress): CheckoutAddress | null {
  const cep = digits(address.cep)
  const street = address.street.trim()
  const number = address.number.trim()
  if (cep.length !== 8 || !street || !number) return null
  return {
    cep,
    street,
    number,
    complement: address.complement.trim(),
    district: address.district.trim(),
    city: address.city.trim(),
    state: address.state.trim().toUpperCase().slice(0, 2),
  }
}

/** Erros que pedem para revisar o carrinho (o resto é do endereço ou de conexão). */
export function isCartError(code: string | undefined): boolean {
  return code === "PRODUCT_UNAVAILABLE" || code === "PRICE_CHANGED" || code === "STOCK_INSUFFICIENT"
}
