'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'
import { ProductGallery, type GalleryImage } from './ProductGallery'
import { BrandFlowerAccent } from './BrandFlowerAccent'

export type SubscriptionSizeOption = {
  label: string
  price: number
  badge?: string | null
  images: GalleryImage[]
}

export type SubscriptionConfiguratorProduct = {
  productId: string
  slug: string
  name: string
  images: GalleryImage[]
  sizes: SubscriptionSizeOption[]
  deliveryFrequencies: string[]
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="10" cy="10" r="9" />
      <path d="m6 10 2.5 2.5L14 7" />
    </svg>
  )
}

const DELIVERY_COUNT_WORDS: Record<number, string> = { 1: 'Один', 2: 'Два', 4: 'Чотири' }

function deliveriesPerMonth(frequencyLabel: string | undefined): number {
  const normalized = (frequencyLabel ?? '').toLowerCase()
  if (normalized.includes('місяц')) return 1
  if (normalized.includes('2') || normalized.includes('два')) return 2
  return 4
}

export function SubscriptionConfigurator({
  id,
  product,
}: {
  id?: string
  product: SubscriptionConfiguratorProduct
}) {
  const cart = useCart()
  const router = useRouter()
  const [variantLabel, setVariantLabel] = useState(
    product.sizes.find((s) => s.badge)?.label ?? product.sizes[0]?.label,
  )
  const [frequencyLabel, setFrequencyLabel] = useState(product.deliveryFrequencies[0])
  const [added, setAdded] = useState(false)

  if (product.sizes.length === 0) return null

  const selectedVariant = product.sizes.find((v) => v.label === variantLabel)
  // Periodicity ("Щотижня" / "Раз на 2 тижні" / "Щомісяця") only governs the delivery
  // calendar (see `monthlyCount` below, used for the checklist copy) — it must never
  // affect price. The subscription price is fixed per size (set per-size in the CMS);
  // per-bouquet price is always that price split across the standard 4 bouquets/month.
  const selectedSizePrice = selectedVariant?.price ?? 0
  const pricePerBouquet = Math.round(selectedSizePrice / 4)
  const monthlyCount = deliveriesPerMonth(frequencyLabel)
  const countWord = DELIVERY_COUNT_WORDS[monthlyCount] ?? String(monthlyCount)
  const bouquetWord = monthlyCount === 1 ? 'букет' : 'букети'

  const checklist = [
    `${countWord} ${bouquetWord} розміру ${variantLabel} на місяць`,
    'Спеціальна ваза та флористичний секатор у подарунок',
    'Пакування',
    'Безкоштовна доставка по Києву',
    'Можливість поставити підписку на паузу в 1 клік',
  ]

  const galleryImages = selectedVariant?.images.length ? selectedVariant.images : product.images

  function handleOrder() {
    const parts = [selectedVariant?.label, frequencyLabel].filter(Boolean)
    cart.addLine({
      productId: product.productId,
      productSlug: product.slug,
      name: product.name,
      image: galleryImages[0]?.url,
      variantLabel: parts.length > 0 ? parts.join(' · ') : undefined,
      unitPrice: selectedSizePrice,
    })
    setAdded(true)
    router.push('/cart')
  }

  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-16">
      <div className="mb-4 flex items-center justify-center gap-3 sm:mb-10">
        <BrandFlowerAccent className="h-6 w-6 shrink-0 text-accent" />
        <h2
          className="text-center text-2xl tracking-wide text-ink sm:text-3xl"
          style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
        >
          Підписка
        </h2>
        <BrandFlowerAccent className="h-6 w-6 shrink-0 text-accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="relative">
            <ProductGallery key={variantLabel} images={galleryImages} aspectClassName="aspect-[16/9] sm:aspect-square" />
            <span className="absolute top-3 left-3 z-10 rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream sm:top-4 sm:left-4 sm:px-4 sm:py-1.5 sm:text-sm">
              Розмір {variantLabel}
            </span>
          </div>
          <p className="hidden text-xs text-ink-soft sm:block">
            Фото з наших попередніх підписок. Склад букета щотижня змінюється залежно від сезону.
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:gap-8">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-ink-soft uppercase sm:mb-3">
              Крок 1 · Розмір букета
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {product.sizes.map((v) => {
                const active = v.label === variantLabel
                return (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => setVariantLabel(v.label)}
                    className={`relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition sm:px-3 sm:py-4 ${
                      active ? 'border-accent bg-accent text-on-accent' : 'border-ink/15 text-ink hover:border-ink/40'
                    }`}
                  >
                    {v.badge && (
                      <span className="absolute -top-2.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-on-accent uppercase sm:px-2 sm:text-[10px]">
                        {v.badge}
                      </span>
                    )}
                    <span className="text-base font-semibold sm:text-xl">{v.label}</span>
                    <span className={`text-[11px] sm:text-xs ${active ? 'text-on-accent/70' : 'text-ink-soft'}`}>
                      {formatUAH(Math.round(v.price / 4))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {product.deliveryFrequencies.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-ink-soft uppercase sm:mb-3">
                Крок 2 · Як часто доставляти
              </p>
              <div className="flex flex-wrap gap-2">
                {product.deliveryFrequencies.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFrequencyLabel(label)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      label === frequencyLabel
                        ? 'border-accent bg-accent text-on-accent'
                        : 'border-ink/20 text-ink hover:border-ink/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <details className="group rounded-2xl bg-blush/60 p-4 sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink">
              Підписка включає
              <span className="text-ink-soft transition group-open:rotate-45">+</span>
            </summary>
            <ul className="mt-3 flex flex-col gap-2.5">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </details>

          <div className="flex flex-col gap-4 border-t border-ink/10 pt-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6 sm:pt-6">
            <div className="flex items-end justify-between gap-4 sm:contents">
              <div>
                <p className="text-xs text-ink-soft">Ціна за 1 букет</p>
                <p className="text-lg font-semibold text-ink">{formatUAH(pricePerBouquet)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-soft">Разом за підписку</p>
                <p className="text-2xl font-semibold text-accent">{formatUAH(selectedSizePrice)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOrder}
              className="rounded-full bg-accent px-6 py-3 text-base font-medium text-on-accent transition hover:bg-accent-hover sm:ml-auto sm:px-8 sm:py-4"
            >
              {added ? 'Додано ✓' : 'Оформити підписку →'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
