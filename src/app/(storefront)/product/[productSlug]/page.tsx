import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getPayloadClient } from '@/lib/payload'
import { AddToCartForm } from '@/components/storefront/AddToCartForm'
import { mediaUrl } from '@/lib/media'

export default async function ProductPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'products',
    where: { and: [{ slug: { equals: productSlug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  })
  const product = result.docs[0]
  if (!product) notFound()

  return (
    <AddToCartForm
      productId={String(product.id)}
      productSlug={product.slug}
      name={product.name}
      basePrice={product.price}
      defaultImageUrl={mediaUrl(product.images?.[0]?.image, 'full')}
      defaultImageAlt={product.images?.[0]?.alt || product.name}
      inStock={product.inStock ?? true}
      variants={(product.variants || []).map((v) => ({
        label: v.label,
        priceModifier: v.priceModifier ?? 0,
        imageUrl: mediaUrl(v.image, 'full'),
      }))}
      description={
        product.description && (
          <div className="text-sm text-ink-soft [&_p]:mb-3">
            <RichText data={product.description} />
          </div>
        )
      }
    />
  )
}
