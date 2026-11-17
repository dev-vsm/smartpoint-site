import { quoteSiteDelivery } from "@/lib/admin-api"
import { type CheckoutAddress, quotableAddress } from "@/lib/checkout"

/**
 * Prévia do frete no carrinho: repassa o endereço ao admin, que mede a rota de carro no
 * Google Maps e escolhe a faixa de /loja/site. É o mesmo cálculo do pedido.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { address?: unknown } | null
  const raw = body?.address as Partial<CheckoutAddress> | undefined
  const fields = ["cep", "street", "number", "complement", "district", "city", "state"] as const
  const address =
    raw && typeof raw === "object" && fields.every((key) => typeof (raw[key] ?? "") === "string")
      ? quotableAddress({
          cep: raw.cep ?? "",
          street: raw.street ?? "",
          number: raw.number ?? "",
          complement: raw.complement ?? "",
          district: raw.district ?? "",
          city: raw.city ?? "",
          state: raw.state ?? "",
        })
      : null
  if (!address) return Response.json({ code: "INVALID_REQUEST" }, { status: 400 })

  const result = await quoteSiteDelivery(address)
  if (!result.ok) {
    return Response.json(
      { code: result.code, error: result.error },
      { status: result.status >= 500 ? 502 : result.status },
    )
  }
  const { fee, label, distanceMeters, district, city } = result.data
  return Response.json({ fee, label, distanceMeters, district, city })
}
