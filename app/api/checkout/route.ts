import { createSiteOrder } from "@/lib/admin-api"
import { ORDER_ID_PATTERN } from "@/lib/checkout"

/**
 * Finalizar a compra: repassa ao admin (servidor a servidor, com o segredo) e devolve o link
 * do Mercado Pago. O corpo é validado de novo no admin, que é quem confere preço, estoque e
 * taxa de entrega — aqui só se barra o que nem chega a ser um pedido.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    orderId?: unknown
    payload?: unknown
  } | null
  if (
    !body ||
    typeof body.orderId !== "string" ||
    !ORDER_ID_PATTERN.test(body.orderId) ||
    !body.payload
  ) {
    return Response.json({ code: "INVALID_REQUEST" }, { status: 400 })
  }
  const result = await createSiteOrder(body.orderId, body.payload)
  if (!result.ok) {
    return Response.json(
      { code: result.code, error: result.error },
      { status: result.status >= 500 ? 502 : result.status },
    )
  }
  if (!result.data.payUrl) return Response.json({ code: "MP_UNAVAILABLE" }, { status: 502 })
  return Response.json({ orderId: result.data.id, payUrl: result.data.payUrl }, { status: 201 })
}
