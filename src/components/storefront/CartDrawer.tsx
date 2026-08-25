'use client'

import { useState } from 'react'
import Link from 'next/link'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const cart = useCart()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex items-center justify-center rounded-full p-2 text-ink transition hover:bg-blush"
        aria-label="Кошик"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="9" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" />
        </svg>
        {cart.totalQuantity > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-cream">
            {cart.totalQuantity}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Закрити"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-sm flex-col bg-cream p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Кошик</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-ink-soft" aria-label="Закрити">
                ✕
              </button>
            </div>

            {cart.lines.length === 0 ? (
              <p className="text-sm text-ink-soft">Кошик порожній</p>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto">
                  {cart.lines.map((line) => (
                    <li key={`${line.productId}-${line.variantLabel ?? ''}`} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{line.name}</p>
                        {line.variantLabel && <p className="text-xs text-ink-soft">{line.variantLabel}</p>}
                        <p className="text-xs text-ink-soft">
                          {line.quantity} × {formatUAH(line.unitPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-ink-soft underline"
                        onClick={() => cart.removeLine(line.productId, line.variantLabel)}
                      >
                        Видалити
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-ink/10 pt-4">
                  <div className="mb-4 flex items-center justify-between text-sm font-medium text-ink">
                    <span>Разом</span>
                    <span>{formatUAH(cart.totalPrice)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-full bg-ink px-6 py-3 text-center text-sm font-medium text-cream transition hover:bg-ink/80"
                  >
                    Оформити замовлення
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
