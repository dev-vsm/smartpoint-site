"use client"

import { useSyncExternalStore } from "react"
import { addItem, type CartItem, parseCart, removeItem, setQuantity } from "@/lib/cart"

/**
 * Carrinho no `localStorage` do navegador — o site não guarda nada no servidor até o
 * cliente finalizar. Uma fonte só para o contador do cabeçalho, o botão do produto e a
 * página do carrinho; outra aba que mexer no carrinho atualiza esta (evento `storage`).
 */
const KEY = "smartpoint:cart:v1"
const EMPTY: CartItem[] = []
const listeners = new Set<() => void>()
let cache: { raw: string | null; items: CartItem[] } | null = null

function read(): CartItem[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    // Armazenamento bloqueado (aba anônima, cookies desligados): carrinho só da sessão em memória.
    return cache?.items ?? EMPTY
  }
  if (cache?.raw !== raw) cache = { raw, items: parseCart(raw) }
  return cache.items
}

function write(items: CartItem[]) {
  const raw = JSON.stringify(items)
  cache = { raw, items }
  try {
    window.localStorage.setItem(KEY, raw)
  } catch {
    // Sem armazenamento: o carrinho continua valendo enquanto a aba estiver aberta.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** No servidor e na hidratação, o carrinho é vazio: o real aparece logo depois. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

export const cartActions = {
  add: (item: Omit<CartItem, "quantity">, quantity = 1) => write(addItem(read(), item, quantity)),
  setQuantity: (productId: string, quantity: number) =>
    write(setQuantity(read(), productId, quantity)),
  remove: (productId: string) => write(removeItem(read(), productId)),
  clear: () => write([]),
}

/**
 * Drawer do carrinho (botão flutuante): aberto ou fechado, compartilhado entre o botão, o
 * "Adicionar" dos cards e o da página do produto — adicionar abre o drawer como confirmação.
 */
let drawerOpen = false
const drawerListeners = new Set<() => void>()

function setDrawer(open: boolean) {
  if (drawerOpen === open) return
  drawerOpen = open
  for (const listener of drawerListeners) listener()
}

export const cartDrawer = {
  open: () => setDrawer(true),
  close: () => setDrawer(false),
  toggle: () => setDrawer(!drawerOpen),
}

export function useCartDrawer(): boolean {
  return useSyncExternalStore(
    (listener) => {
      drawerListeners.add(listener)
      return () => drawerListeners.delete(listener)
    },
    () => drawerOpen,
    () => false,
  )
}
