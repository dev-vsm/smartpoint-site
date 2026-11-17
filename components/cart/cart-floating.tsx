"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useRef } from "react"
import { BagIcon } from "@/components/cart/bag-icon"
import { cartCount, cartSubtotal } from "@/lib/cart"
import { cartActions, cartDrawer, useCart, useCartDrawer } from "@/lib/cart-store"
import { cn, formatPrice } from "@/lib/utils"

/** No carrinho, na página do pedido e no acompanhamento o drawer seria redundante. */
const HIDDEN = [/^\/carrinho\/?$/, /^\/pedido(\/|$)/, /^\/acompanhar(\/|$)/]

/**
 * Carrinho flutuante no canto direito: o botão mostra quantos itens há e abre um drawer
 * pequeno, retangular, que sobe com transição suave. Sem fundo escurecido nem desfoque — a
 * página continua visível e utilizável. Fecha no ×, no Esc, clicando fora ou mudando de página.
 * No celular fica acima do botão do WhatsApp e da barra fixa da página do produto.
 */
export function CartFloating() {
  const pathname = usePathname()
  const cart = useCart()
  const open = useCartDrawer()
  const panelId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const count = cartCount(cart)
  const hidden = HIDDEN.some((route) => route.test(pathname))

  // Mudou de página (inclusive pelo "Ir para o carrinho"): fecha.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a troca de rota é o gatilho.
  useEffect(() => {
    cartDrawer.close()
  }, [pathname])

  useEffect(() => {
    if (!open) return
    panel.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      cartDrawer.close()
      toggle.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (panel.current?.contains(target) || toggle.current?.contains(target)) return
      cartDrawer.close()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  if (hidden) return null

  return (
    <>
      <div
        ref={panel}
        id={panelId}
        role="dialog"
        aria-label="Seu carrinho"
        tabIndex={-1}
        inert={!open}
        className={cn(
          "fixed right-4 bottom-[9.5rem] z-50 flex max-h-[min(32rem,calc(100dvh-12rem))] w-[22rem] max-w-[calc(100vw-2rem)] origin-bottom-right flex-col overflow-hidden rounded-md bg-paper shadow-xl shadow-ink/15 ring-1 ring-line outline-none transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none md:right-6 md:bottom-24",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="font-semibold">
            Seu carrinho{count ? ` (${count} ${count === 1 ? "item" : "itens"})` : ""}
          </p>
          <button
            type="button"
            aria-label="Fechar o carrinho"
            onClick={() => {
              cartDrawer.close()
              toggle.current?.focus()
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-xl leading-none text-ink-soft hover:bg-brand-soft hover:text-ink"
          >
            ×
          </button>
        </div>

        {cart.length ? (
          <>
            <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto overscroll-contain">
              {cart.map((item) => (
                <li key={item.productId} className="flex gap-3 px-4 py-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-paper ring-1 ring-line">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain p-0.5"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produtos/${item.slug}`}
                      className="line-clamp-2 text-sm font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-1.5">
                      <StepButton
                        label={`Tirar um: ${item.name}`}
                        onClick={() => cartActions.setQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </StepButton>
                      <span className="w-5 text-center text-sm font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <StepButton
                        label={`Mais um: ${item.name}`}
                        disabled={item.quantity >= item.maxQuantity}
                        onClick={() => cartActions.setQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </StepButton>
                      <span className="ml-auto text-sm font-bold">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-line px-4 py-3">
              <p className="flex justify-between text-sm">
                <span className="text-ink-soft">Subtotal</span>
                <strong>{formatPrice(cartSubtotal(cart))}</strong>
              </p>
              <Link
                href="/carrinho"
                className="flex min-h-11 w-full items-center justify-center rounded-sm bg-brand px-4 font-semibold text-brand-ink hover:bg-brand-strong hover:text-paper"
              >
                Ir para o carrinho
              </Link>
            </div>
          </>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-ink-soft">
            Seu carrinho está vazio. Os produtos com pronta entrega têm o botão “Adicionar”.
          </p>
        )}
      </div>

      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          count ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho vazio"
        }
        onClick={cartDrawer.toggle}
        className={cn(
          "fixed right-4 bottom-[5.5rem] z-50 h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-ink shadow-lg shadow-ink/20 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none md:right-6 md:bottom-6",
          // Vazio no celular, só cobria botões e textos: aparece quando há itens.
          count ? "flex" : "hidden md:flex",
        )}
      >
        <BagIcon className="h-7 w-7" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-6 rounded-full bg-tag px-1.5 text-center text-xs font-bold leading-6 text-tag-ink ring-2 ring-paper">
            {count}
          </span>
        )}
      </button>
    </>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-sm font-bold text-brand-strong ring-1 ring-line hover:bg-brand-soft disabled:opacity-40"
    >
      {children}
    </button>
  )
}
