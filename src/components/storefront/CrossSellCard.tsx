'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'
import { trackCrossSellAdd, type CrossSellItem } from '@/lib/crossSell'

export function CrossSellCard({ item }: { item: CrossSellItem }) {
  const cart = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    cart.addLine({
      productId: item.productId,
      productSlug: item.productSlug,
      name: item.name,
      image: item.imageUrl ?? undefined,
      unitPrice: item.price,
    })
    trackCrossSellAdd(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <Link
        href={`/product/${item.productSlug}`}
        className="relative block aspect-square overflow-hidden bg-blush"
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 640px) 25vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={`/product/${item.productSlug}`}
          className="text-sm font-medium text-ink transition hover:text-accent"
        >
          {item.name}
        </Link>
        <span className="text-sm font-semibold text-accent">{formatUAH(item.price)}</span>
        <button
          type="button"
          onClick={handleAdd}
          className="mt-auto rounded-full border border-ink/20 px-4 py-2 text-xs font-medium text-ink transition hover:border-ink/50"
        >
          {added ? 'Додано ✓' : '+ Додати'}
        </button>
      </div>
    </div>
  )
}
