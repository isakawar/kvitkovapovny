'use client'

import { useMemo, useState } from 'react'

import { ProductCard, type ProductCardData } from './ProductCard'

type OccasionTag = 'birthday' | 'romantic' | 'gentle'

export type BouquetProductData = ProductCardData & {
  occasionTags: OccasionTag[]
  featured: boolean
  sortOrder: number
}

const TABS: { label: string; value: 'all' | OccasionTag }[] = [
  { label: 'Усі', value: 'all' },
  { label: 'Дня народження', value: 'birthday' },
  { label: 'Романтичні', value: 'romantic' },
  { label: 'Ніжні', value: 'gentle' },
]

type SortOption = 'popular' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Спочатку популярні', value: 'popular' },
  { label: 'За зростанням ціни', value: 'price-asc' },
  { label: 'За спаданням ціни', value: 'price-desc' },
]

export function BouquetCatalog({ products }: { products: BouquetProductData[] }) {
  const [activeTab, setActiveTab] = useState<'all' | OccasionTag>('all')
  const [sortOption, setSortOption] = useState<SortOption>('popular')

  const visible = useMemo(() => {
    const filtered =
      activeTab === 'all' ? products : products.filter((p) => p.occasionTags.includes(activeTab))

    const sorted = [...filtered]
    if (sortOption === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortOption === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price)
    } else {
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
    }
    return sorted
  }, [products, activeTab, sortOption])

  return (
    <section className="mx-auto min-h-[60vh] max-w-6xl px-4 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.value
                  ? 'border-ink bg-ink text-cream'
                  : 'border-ink/20 text-ink hover:border-ink/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <span className="sr-only">Сортування</span>
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as SortOption)}
            className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm text-ink transition hover:border-ink/50"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-ink-soft">У цій категорії поки немає товарів.</p>
      )}
    </section>
  )
}
