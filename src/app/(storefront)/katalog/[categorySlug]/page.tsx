import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { mediaUrl } from '@/lib/media'

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const payload = await getPayloadClient()

  const categoryResult = await payload.find({
    collection: 'categories',
    where: { and: [{ slug: { equals: categorySlug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  })
  const category = categoryResult.docs[0]
  if (!category) notFound()

  const products = await payload.find({
    collection: 'products',
    where: {
      and: [{ _status: { equals: 'published' } }, { categories: { in: [category.id] } }],
    },
    sort: 'sortOrder',
    limit: 50,
  })

  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-2xl font-semibold uppercase tracking-wide text-ink">{category.name}</h1>
        {category.description && <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft">{category.description}</p>}
      </div>
      <ProductGrid
        products={products.docs.map((p) => ({
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
