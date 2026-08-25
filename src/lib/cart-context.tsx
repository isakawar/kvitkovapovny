'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type CartLine = {
  productId: string
  productSlug: string
  name: string
  image?: string
  variantLabel?: string
  unitPrice: number
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  addLine: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void
  removeLine: (productId: string, variantLabel?: string) => void
  setQuantity: (productId: string, variantLabel: string | undefined, quantity: number) => void
  clear: () => void
  totalQuantity: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'kvitkova-cart'

function lineKey(productId: string, variantLabel?: string) {
  return `${productId}::${variantLabel ?? ''}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      // One-time hydration from localStorage after mount, deliberately outside render:
      // reading it during render would mismatch the server-rendered (empty) markup.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw))
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [lines, hydrated])

  const addLine = useCallback((line: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((prev) => {
      const key = lineKey(line.productId, line.variantLabel)
      const existing = prev.find((l) => lineKey(l.productId, l.variantLabel) === key)
      if (existing) {
        return prev.map((l) =>
          lineKey(l.productId, l.variantLabel) === key ? { ...l, quantity: l.quantity + quantity } : l,
        )
      }
      return [...prev, { ...line, quantity }]
    })
  }, [])

  const removeLine = useCallback((productId: string, variantLabel?: string) => {
    const key = lineKey(productId, variantLabel)
    setLines((prev) => prev.filter((l) => lineKey(l.productId, l.variantLabel) !== key))
  }, [])

  const setQuantity = useCallback((productId: string, variantLabel: string | undefined, quantity: number) => {
    const key = lineKey(productId, variantLabel)
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => lineKey(l.productId, l.variantLabel) !== key)
        : prev.map((l) => (lineKey(l.productId, l.variantLabel) === key ? { ...l, quantity } : l)),
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const totalQuantity = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines])
  const totalPrice = useMemo(() => lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0), [lines])

  const value = useMemo(
    () => ({ lines, addLine, removeLine, setQuantity, clear, totalQuantity, totalPrice }),
    [lines, addLine, removeLine, setQuantity, clear, totalQuantity, totalPrice],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
