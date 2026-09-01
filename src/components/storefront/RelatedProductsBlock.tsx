import { CrossSellCard } from './CrossSellCard'
import type { CrossSellItem } from '@/lib/crossSell'

export function RelatedProductsBlock({ items }: { items: CrossSellItem[] }) {
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16">
      <h2 className="mb-6 text-xl font-semibold text-ink">Разом купують</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <CrossSellCard key={item.productId} item={item} />
        ))}
      </div>
    </section>
  )
}
