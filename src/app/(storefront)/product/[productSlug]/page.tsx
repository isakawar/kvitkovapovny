import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getPayloadClient } from '@/lib/payload'
import { AddToCartForm } from '@/components/storefront/AddToCartForm'
import { mediaUrl } from '@/lib/media'
import { richTextToPlainText } from '@/lib/richTextToPlainText'
import { pageMetadata } from '@/lib/pageMetadata'
import type { Category } from '@/payload-types'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const getProduct = cache(async (productSlug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: { and: [{ slug: { equals: productSlug } }, { _status: { equals: 'published' } }] },
    depth: 1,
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

  const base = pageMetadata({ path: `/product/${product.slug}`, title, description })
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
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

  const firstCategory = (product.categories || []).find(
    (c): c is Category => typeof c === 'object' && c !== null,
  )
  const productDisplayName = product.pdpHeading || product.name

  const breadcrumbItems = [
    { name: 'Головна', url: SITE_URL },
    { name: 'Каталог', url: `${SITE_URL}/katalog` },
    ...(firstCategory ? [{ name: firstCategory.name, url: `${SITE_URL}/katalog/${firstCategory.slug}` }] : []),
    { name: productDisplayName, url: `${SITE_URL}/product/${product.slug}` },
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

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
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'UAH' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'UA' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'UA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 1,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
