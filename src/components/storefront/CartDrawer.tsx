'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'
import { track } from '@/lib/analytics'

export type CrossSellProduct = {
  productId: string
  productSlug: string
  name: string
  price: number
  imageUrl?: string | null
}

export function CartDrawer({ crossSellProducts = [] }: { crossSellProducts?: CrossSellProduct[] }) {
  const [open, setOpen] = useState(false)
  const cart = useCart()

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (cart.lines.length > 0) {
            track('view_cart', {
              currency: 'UAH',
              value: cart.totalPrice / 100,
              items: cart.lines.map((line) => ({
                item_id: line.productId,
                item_name: line.name,
                item_variant: line.variantLabel,
                price: line.unitPrice / 100,
                quantity: line.quantity,
              })),
            })
          }
          setOpen(true)
        }}
        className="relative flex items-center justify-center rounded-full p-2 text-ink transition hover:bg-blush"
        aria-label="Кошик"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="9" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" />
        </svg>
        {cart.totalQuantity > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-on-accent">
            {cart.totalQuantity}
          </span>
        )}
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex justify-end">
            <button
              type="button"
              aria-label="Закрити"
              className="absolute inset-0 bg-ink/40"
              onClick={() => setOpen(false)}
            />
            <div className="relative flex h-full w-full max-w-sm flex-col bg-cream p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Кошик</h2>
                <button type="button" onClick={() => setOpen(false)} className="text-ink-soft" aria-label="Закрити">
                  ✕
                </button>
              </div>

              {cart.lines.length === 0 ? (
                <p className="text-sm text-ink-soft">Кошик порожній</p>
              ) : (
                <>
                  <p className="mb-4 rounded-xl bg-blush/60 px-3 py-2 text-xs font-medium text-ink">
                    🎁 До вашого замовлення додано: Ваза та секатор у ПОДАРУНОК
                  </p>

                  <ul className="flex-1 space-y-4 overflow-y-auto">
                    {cart.lines.map((line) => (
                      <li key={`${line.productId}-${line.variantLabel ?? ''}`} className="flex items-start gap-3">
                        <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-lg bg-blush">
                          {line.image && <Image src={line.image} alt={line.name} fill sizes="50px" className="object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink">{line.name}</p>
                          {line.variantLabel && <p className="text-xs text-ink-soft">{line.variantLabel}</p>}
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex items-center rounded-full border border-ink/20">
                              <button
                                type="button"
                                onClick={() => cart.setQuantity(line.productId, line.variantLabel, line.quantity - 1)}
                                className="px-2 py-0.5 text-xs text-ink-soft"
                                aria-label="Менше"
                              >
                                −
                              </button>
                              <span className="w-5 text-center text-xs text-ink">{line.quantity}</span>
                              <button
                                type="button"
                                onClick={() => cart.setQuantity(line.productId, line.variantLabel, line.quantity + 1)}
                                className="px-2 py-0.5 text-xs text-ink-soft"
                                aria-label="Більше"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs text-ink-soft">× {formatUAH(line.unitPrice)}</span>
                          </div>
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

                  {crossSellProducts.length > 0 && (
                    <div className="mt-6 border-t border-ink/10 pt-4">
                      <p className="mb-3 text-xs font-semibold tracking-wide text-ink uppercase">Додати до замовлення</p>
                      <div className="flex flex-col gap-2">
                        {crossSellProducts.map((p) => (
                          <div key={p.productId} className="flex items-center gap-3 rounded-xl bg-blush/40 p-2">
                            <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-lg bg-blush">
                              {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="50px" className="object-cover" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-ink">{p.name}</p>
                              <p className="text-xs text-ink-soft">{formatUAH(p.price)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                cart.addLine({
                                  productId: p.productId,
                                  productSlug: p.productSlug,
                                  name: p.name,
                                  image: p.imageUrl ?? undefined,
                                  unitPrice: p.price,
                                })
                              }
                              className="shrink-0 rounded-full border border-ink/20 px-3 py-1 text-xs text-ink transition hover:border-ink/50"
                            >
                              + Додати
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 border-t border-ink/10 pt-4">
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
          </div>,
          document.body,
        )}
    </>
  )
}
