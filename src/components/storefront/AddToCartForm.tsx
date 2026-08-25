'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'

type Variant = {
  label: string
  priceModifier: number
  imageUrl?: string | null
}

type AddToCartFormProps = {
  productId: string
  productSlug: string
  name: string
  basePrice: number
  defaultImageUrl?: string | null
  defaultImageAlt?: string
  inStock: boolean
  variants: Variant[]
  description?: React.ReactNode
}

export function AddToCartForm({
  productId,
  productSlug,
  name,
  basePrice,
  defaultImageUrl,
  defaultImageAlt,
  inStock,
  variants,
  description,
}: AddToCartFormProps) {
  const [variantLabel, setVariantLabel] = useState(variants[0]?.label)
  const [quantity, setQuantity] = useState(1)
  const cart = useCart()
  const router = useRouter()

  const selectedVariant = variants.find((v) => v.label === variantLabel)
  const unitPrice = basePrice + (selectedVariant?.priceModifier ?? 0)
  const displayImageUrl = selectedVariant?.imageUrl || defaultImageUrl

  function handleAdd() {
    cart.addLine(
      {
        productId,
        productSlug,
        name,
        image: displayImageUrl ?? undefined,
        variantLabel: selectedVariant?.label,
        unitPrice,
      },
      quantity,
    )
    router.refresh()
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-blush">
        {displayImageUrl && (
          <Image
            key={displayImageUrl}
            src={displayImageUrl}
            alt={defaultImageAlt || name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-ink">{name}</h1>

        {variants.length > 0 && (
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
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xl font-semibold text-accent">{formatUAH(unitPrice)}</p>

        <div className="flex items-center gap-3">
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

          <button
            type="button"
            disabled={!inStock}
            onClick={handleAdd}
            className="flex-1 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80 disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            {inStock ? 'У кошик' : 'Немає в наявності'}
          </button>
        </div>

        {description}
      </div>
    </div>
  )
}
