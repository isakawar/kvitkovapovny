'use client'

import { useState } from 'react'
import Image from 'next/image'

import { formatUAH } from '@/lib/money'
import { SubscriptionCheckoutModal } from './SubscriptionCheckoutModal'

export type PricingCardData = {
  productId: string
  slug: string
  name: string
  cardSubtitle?: string | null
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
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition outline-none focus:outline-none focus-visible:outline-none ${
        product.highlighted ? 'ring-1 ring-[#9EAF00]/40' : 'hover:shadow-md'
      }`}
      style={product.highlighted ? { boxShadow: '0px 10px 30px rgba(158, 175, 0, 0.15)' } : undefined}
    >
      {product.badge && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-on-accent uppercase">
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
        <div>
          <h3 className="text-base font-semibold text-ink">{product.name}</h3>
          {product.cardSubtitle && <p className="mt-0.5 text-sm text-ink-soft">{product.cardSubtitle}</p>}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-[#1E1E1E]">{formatUAH(product.price)}</span>
          {product.priceSuffixLabel && <span className="text-xs text-[#7A7A7A]">{product.priceSuffixLabel}</span>}
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
          onClick={() => setCheckoutOpen(true)}
          className={`mt-auto rounded-full px-6 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
            product.highlighted
              ? 'bg-[#9EAF00] font-bold text-[#1E1E1E] hover:bg-[#9EAF00]/85'
              : 'bg-blush font-medium text-ink hover:bg-blush/70'
          }`}
        >
          {!product.inStock ? 'Немає в наявності' : product.ctaLabel || 'Обрати'}
        </button>
      </div>

      {checkoutOpen && (
        <SubscriptionCheckoutModal
          productId={product.productId}
          productName={product.name}
          sizeLabel={product.name}
          frequencyLabel="Щотижня"
          deliveriesPerMonth={4}
          price={product.price}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  )
}
