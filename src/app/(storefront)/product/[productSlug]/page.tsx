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
      name={product.pdpHeading || product.name}
      cartName={product.name}
      basePrice={product.price}
      priceSuffixLabel={product.priceSuffixLabel}
      images={(product.images || [])
        .map((img) => {
          const url = mediaUrl(img.image, 'full')
          return url ? { url, alt: img.alt || product.name } : null
        })
        .filter((img): img is { url: string; alt: string } => img !== null)}
      inStock={product.inStock ?? true}
      variants={(product.variants || []).map((v) => ({
        label: v.label,
        priceModifier: v.priceModifier ?? 0,
        imageUrl: mediaUrl(v.image, 'full'),
        recommended: v.recommended,
      }))}
      deliveryFrequencies={(product.deliveryFrequencies || []).map((f) => f.label)}
      deliveryDays={(product.deliveryDays || []).map((d) => d.label)}
      ctaLabel={product.ctaLabel}
      trustBadges={(product.trustBadges || []).map((b) => ({ icon: b.icon, label: b.label, note: b.note }))}
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
