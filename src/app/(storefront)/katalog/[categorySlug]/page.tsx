import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/pageMetadata'

import { getPayloadClient } from '@/lib/payload'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { BouquetCatalog, type BouquetProductData } from '@/components/storefront/BouquetCatalog'
import { PricingGrid, type PricingProductData } from '@/components/storefront/PricingGrid'
import { FaqAccordion } from '@/components/storefront/FaqAccordion'
import { mediaUrl } from '@/lib/media'

const getCategory = cache(async (categorySlug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    where: { and: [{ slug: { equals: categorySlug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  })
  return result.docs[0]
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await getCategory(categorySlug)
  if (!category) return {}

  const title =
    category.slug === 'pidpyska' ? 'Підписка на квіти в Києві | Kvitkova Povnya' : `${category.name} | Kvitkova Povnya`
  const description =
    category.slug === 'pidpyska'
      ? 'Оберіть ідеальний розмір та частоту доставок квітів для дому або офісу.'
      : category.description || `${category.name} з доставкою по Києву від Kvitkova Povnya.`

  return pageMetadata({ path: `/katalog/${category.slug}`, title, description })
}

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const payload = await getPayloadClient()

  const category = await getCategory(categorySlug)
  if (!category) notFound()

  const products = await payload.find({
    collection: 'products',
    where: {
      and: [{ _status: { equals: 'published' } }, { categories: { in: [category.id] } }],
    },
    sort: 'sortOrder',
    limit: 50,
  })

  const isPricingCatalog = category.slug === 'pidpyska'
  const isBouquetCatalog = category.slug === 'buket'

  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-2xl font-semibold uppercase tracking-wide text-ink sm:text-3xl">
          {isPricingCatalog ? 'ПІДПИСКА НА КВІТИ В КИЄВІ' : category.name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft">
          {isPricingCatalog
            ? 'Оберіть ідеальний розмір та частоту доставок для дому або офісу'
            : category.description}
        </p>
      </div>

      {isPricingCatalog ? (
        <PricingGrid
          products={products.docs.map(
            (p): PricingProductData => ({
              productId: String(p.id),
              slug: p.slug,
              name: p.name,
              cardSubtitle: p.cardSubtitle,
              price: p.price,
              priceSuffixLabel: p.priceSuffixLabel,
              imageUrl: mediaUrl(p.images?.[0]?.image, 'card'),
              imageAlt: p.images?.[0]?.alt || p.name,
              bullets: (p.bullets || []).map((b) => b.label),
              badge: p.badge,
              ctaLabel: p.ctaLabel,
              highlighted: p.highlighted,
              inStock: p.inStock ?? true,
              audienceTags: (p.audienceTags || []) as PricingProductData['audienceTags'],
            }),
          )}
        />
      ) : isBouquetCatalog ? (
        <BouquetCatalog
          products={products.docs.map(
            (p): BouquetProductData => ({
              productId: String(p.id),
              slug: p.slug,
              name: p.name,
              price: p.price,
              imageUrl: mediaUrl(p.images?.[0]?.image, 'card'),
              imageAlt: p.images?.[0]?.alt || p.name,
              inStock: p.inStock ?? true,
              badge: p.badge,
              freeDeliveryBadge: p.freeDeliveryBadge,
              vaseGiftBadge: p.vaseGiftBadge,
              occasionTags: (p.occasionTags || []) as BouquetProductData['occasionTags'],
              featured: p.featured ?? false,
              sortOrder: p.sortOrder ?? 0,
            }),
          )}
        />
      ) : (
        <ProductGrid
          products={products.docs.map((p) => ({
            productId: String(p.id),
            slug: p.slug,
            name: p.name,
            price: p.price,
            imageUrl: mediaUrl(p.images?.[0]?.image, 'card'),
            imageAlt: p.images?.[0]?.alt || p.name,
            inStock: p.inStock ?? true,
            badge: p.badge,
            freeDeliveryBadge: p.freeDeliveryBadge,
            vaseGiftBadge: p.vaseGiftBadge,
          }))}
        />
      )}

      {isPricingCatalog && (
        <FaqAccordion
          heading="Часті запитання про підписку на квіти"
          items={(category.faqItems || []).map((item) => ({ question: item.question, answer: item.answer }))}
        />
      )}
    </div>
  )
}
