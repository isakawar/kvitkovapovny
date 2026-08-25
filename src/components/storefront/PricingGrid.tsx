'use client'

import { useState } from 'react'

import { PricingCard, type PricingCardData } from './PricingCard'

type AudienceTag = 'home' | 'business' | 'trial'

export type PricingProductData = PricingCardData & { audienceTags: AudienceTag[] }

const TABS: { label: string; value: 'all' | AudienceTag }[] = [
  { label: 'Усі', value: 'all' },
  { label: 'Для дому', value: 'home' },
  { label: 'Для бізнесу', value: 'business' },
  { label: 'Тестовий тиждень', value: 'trial' },
]

export function PricingGrid({ products }: { products: PricingProductData[] }) {
  const [activeTab, setActiveTab] = useState<'all' | AudienceTag>('all')

  if (products.length === 0) return null

  const visible =
    activeTab === 'all' ? products : products.filter((p) => p.audienceTags.includes(activeTab))

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              activeTab === tab.value
                ? 'border-ink bg-ink text-cream'
                : 'border-ink/20 text-ink hover:border-ink/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((product) => (
            <PricingCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-ink-soft">У цій категорії поки немає товарів.</p>
      )}
    </section>
  )
}
