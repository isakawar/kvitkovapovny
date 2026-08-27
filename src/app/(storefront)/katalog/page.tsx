import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/pageMetadata'

import { getPayloadClient } from '@/lib/payload'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { mediaUrl } from '@/lib/media'

export const metadata: Metadata = pageMetadata({
  path: '/katalog',
  title: 'Каталог товарів | Kvitkova Povnya',
  description: 'Усі букети, підписки на квіти та товари Kvitkova Povnya в одному каталозі.',
})

export default async function CatalogPage() {
  const payload = await getPayloadClient()

  const products = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' } },
    sort: 'sortOrder',
    limit: 100,
  })

  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-2xl font-semibold uppercase tracking-wide text-ink">Каталог</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft">Усі букети, підписки та товари в одному місці.</p>
      </div>
      <ProductGrid
        products={products.docs.map((p) => ({
          productId: String(p.id),
          slug: p.slug,
          name: p.name,
          price: p.price,
          imageUrl: mediaUrl(p.images?.[0]?.image, 'card'),
          imageAlt: p.images?.[0]?.alt || p.name,
          inStock: p.inStock ?? true,
        }))}
      />
    </div>
  )
}
