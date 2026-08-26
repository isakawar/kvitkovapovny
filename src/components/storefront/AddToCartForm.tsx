'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'
import { ProductGallery, type GalleryImage } from './ProductGallery'
import { QuickOrderModal } from './QuickOrderModal'

type Variant = {
  label: string
  priceModifier: number
  imageUrl?: string | null
  recommended?: boolean | null
}

type TrustBadge = {
  icon?: string | null
  label: string
  note?: string | null
}

type AddToCartFormProps = {
  productId: string
  productSlug: string
  name: string
  cartName?: string
  basePrice: number
  priceSuffixLabel?: string | null
  images: GalleryImage[]
  inStock: boolean
  variants: Variant[]
  deliveryFrequencies: string[]
  deliveryDays: string[]
  ctaLabel?: string | null
  trustBadges: TrustBadge[]
  description?: React.ReactNode
}

export function AddToCartForm({
  productId,
  productSlug,
  name,
  cartName,
  basePrice,
  priceSuffixLabel,
  images,
  inStock,
  variants,
  deliveryFrequencies,
  deliveryDays,
  ctaLabel,
  trustBadges,
  description,
}: AddToCartFormProps) {
  const [variantLabel, setVariantLabel] = useState(variants.find((v) => v.recommended)?.label ?? variants[0]?.label)
  const [frequencyLabel, setFrequencyLabel] = useState(deliveryFrequencies[0])
  const [deliveryDayLabel, setDeliveryDayLabel] = useState(deliveryDays[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [quickOrderOpen, setQuickOrderOpen] = useState(false)
  const cart = useCart()
  const router = useRouter()

  const isSimpleProduct = deliveryFrequencies.length === 0 && deliveryDays.length === 0
  const selectedVariant = variants.find((v) => v.label === variantLabel)
  const unitPrice = basePrice + (selectedVariant?.priceModifier ?? 0)

  function handleAdd() {
    const parts = [selectedVariant?.label, frequencyLabel, deliveryDayLabel].filter(Boolean)
    cart.addLine(
      {
        productId,
        productSlug,
        name: cartName || name,
        image: selectedVariant?.imageUrl || images[0]?.url,
        variantLabel: parts.length > 0 ? parts.join(' · ') : undefined,
        unitPrice,
      },
      quantity,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    router.refresh()
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-2">
      <ProductGallery images={images} activeOverrideUrl={selectedVariant?.imageUrl} />

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-ink">{name}</h1>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-accent">{formatUAH(unitPrice)}</span>
          {priceSuffixLabel && <span className="text-sm text-ink-soft">({priceSuffixLabel})</span>}
        </div>

        {!isSimpleProduct && variants.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Розмір:</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => setVariantLabel(v.label)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    v.label === variantLabel
                      ? 'border-ink bg-ink text-cream'
                      : 'border-ink/20 text-ink hover:border-ink/50'
                  }`}
                >
                  {v.label}
                  {v.recommended && <span className="ml-1 text-xs opacity-80">(Рекомендовано)</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {deliveryFrequencies.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Частота доставок:</p>
            <div className="flex flex-col gap-2">
              {deliveryFrequencies.map((label) => (
                <label key={label} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="frequency"
                    checked={frequencyLabel === label}
                    onChange={() => setFrequencyLabel(label)}
                    className="accent-ink"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {deliveryDays.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink">День доставки:</p>
            <div className="flex flex-wrap gap-2">
              {deliveryDays.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDeliveryDayLabel(label)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    label === deliveryDayLabel
                      ? 'border-ink bg-ink text-cream'
                      : 'border-ink/20 text-ink hover:border-ink/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isSimpleProduct && (
            <div className="flex items-center rounded-full border border-ink/20">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-ink-soft"
                aria-label="Менше"
              >
                −
              </button>
              <span className="w-8 text-center text-sm text-ink">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 text-ink-soft"
                aria-label="Більше"
              >
                +
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={!inStock}
            onClick={handleAdd}
            className="flex-1 rounded-full bg-accent px-6 py-4 text-base font-semibold tracking-wide text-on-accent uppercase transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!inStock ? 'Немає в наявності' : added ? 'Додано ✓' : ctaLabel || 'У кошик'}
          </button>
        </div>

        {isSimpleProduct && inStock && (
          <button
            type="button"
            onClick={() => setQuickOrderOpen(true)}
            className="rounded-full border border-ink/20 px-6 py-4 text-base font-semibold tracking-wide text-ink uppercase transition hover:border-ink/50"
          >
            Швидке замовлення
          </button>
        )}

        {quickOrderOpen && (
          <QuickOrderModal
            productId={productId}
            productName={cartName || name}
            unitPrice={unitPrice}
            onClose={() => setQuickOrderOpen(false)}
          />
        )}

        {trustBadges.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl bg-blush/50 p-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-start gap-3 text-sm">
                {badge.icon && <span className="text-lg leading-none">{badge.icon}</span>}
                <span className="text-ink">
                  <span className="font-semibold">{badge.label}</span>
                  {badge.note && <span className="text-ink-soft"> {badge.note}</span>}
                </span>
              </div>
            ))}
          </div>
        )}

        {description}
      </div>
    </div>
  )
}
