'use client'

import Link from 'next/link'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'

export default function CartPage() {
  const cart = useCart()

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-ink">Кошик порожній</h1>
        <Link href="/" className="text-sm text-accent underline">
          Перейти до каталогу
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-ink">Кошик</h1>
      <ul className="space-y-4">
        {cart.lines.map((line) => (
          <li
            key={`${line.productId}-${line.variantLabel ?? ''}`}
            className="flex items-center justify-between gap-4 rounded-xl bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-ink">{line.name}</p>
              {line.variantLabel && <p className="text-xs text-ink-soft">{line.variantLabel}</p>}
              <p className="text-xs text-ink-soft">{formatUAH(line.unitPrice)} / шт</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border border-ink/20">
                <button
                  type="button"
                  className="px-3 py-1 text-ink-soft"
                  onClick={() => cart.setQuantity(line.productId, line.variantLabel, line.quantity - 1)}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{line.quantity}</span>
                <button
                  type="button"
                  className="px-3 py-1 text-ink-soft"
                  onClick={() => cart.setQuantity(line.productId, line.variantLabel, line.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="text-xs text-ink-soft underline"
                onClick={() => cart.removeLine(line.productId, line.variantLabel)}
              >
                Видалити
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6">
        <span className="text-sm font-medium text-ink">Разом</span>
        <span className="text-lg font-semibold text-accent">{formatUAH(cart.totalPrice)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-full bg-ink px-6 py-3 text-center text-sm font-medium text-cream transition hover:bg-ink/80"
      >
        Оформити замовлення
      </Link>
    </div>
  )
}
