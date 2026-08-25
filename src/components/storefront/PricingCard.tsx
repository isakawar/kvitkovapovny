'use client'

import { useState } from 'react'
import Image from 'next/image'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'

export type PricingCardData = {
  productId: string
  slug: string
  name: string
  price: number
  priceSuffixLabel?: string | null
  imageUrl?: string | null
  imageAlt?: string
  bullets: string[]
  badge?: string | null
  ctaLabel?: string | null
  highlighted?: boolean | null
  inStock: boolean
}

export function PricingCard({ product }: { product: PricingCardData }) {
  const cart = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    cart.addLine({
      productId: product.productId,
      productSlug: product.slug,
      name: product.name,
      image: product.imageUrl ?? undefined,
      unitPrice: product.price,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md ${
        product.highlighted ? 'ring-2 ring-ink' : ''
      }`}
    >
      {product.badge && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-cream uppercase">
          {product.badge}
        </span>
      )}

      <div className="relative aspect-square overflow-hidden bg-blush">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base font-semibold text-ink">{product.name}</h3>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-accent">{formatUAH(product.price)}</span>
          {product.priceSuffixLabel && <span className="text-xs text-ink-soft">{product.priceSuffixLabel}</span>}
        </div>

        {product.bullets.length > 0 && (
          <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
            {product.bullets.map((bullet) => (
              <li key={bullet}>✓ {bullet}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={!product.inStock}
          onClick={handleAdd}
          className={`mt-auto rounded-full px-6 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
            product.highlighted
              ? 'bg-ink text-cream hover:bg-ink/80'
              : 'bg-blush text-ink hover:bg-blush/70'
          }`}
        >
          {!product.inStock ? 'Немає в наявності' : added ? 'Додано ✓' : product.ctaLabel || 'У кошик'}
        </button>
      </div>
    </div>
  )
}
