import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getPayloadClient } from '@/lib/payload'
import { AddToCartForm } from '@/components/storefront/AddToCartForm'
import { mediaUrl } from '@/lib/media'
import { richTextToPlainText } from '@/lib/richTextToPlainText'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const getProduct = cache(async (productSlug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: { and: [{ slug: { equals: productSlug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  })
  return result.docs[0]
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>
}): Promise<Metadata> {
  const { productSlug } = await params
  const product = await getProduct(productSlug)
  if (!product) return {}

  const title = `${product.pdpHeading || product.name} | Kvitkova Povnya`
  const description =
    richTextToPlainText(product.description) ||
    `${product.name} — замовити з доставкою по Києву від Kvitkova Povnya.`
  const imageUrl = mediaUrl(product.images?.[0]?.image, 'full')

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${product.slug}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params
  const product = await getProduct(productSlug)
  if (!product) notFound()

  const imageUrl = mediaUrl(product.images?.[0]?.image, 'full')
  const absoluteImageUrl = imageUrl ? new URL(imageUrl, SITE_URL).toString() : undefined
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: richTextToPlainText(product.description) || undefined,
    image: absoluteImageUrl ? [absoluteImageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'UAH',
      price: (product.price / 100).toFixed(2),
      availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${SITE_URL}/product/${product.slug}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
    </>
  )
}
