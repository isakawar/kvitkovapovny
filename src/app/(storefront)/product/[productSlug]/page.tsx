import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getPayloadClient } from '@/lib/payload'
import { AddToCartForm } from '@/components/storefront/AddToCartForm'
import { RelatedProductsBlock } from '@/components/storefront/RelatedProductsBlock'
import { mediaUrl } from '@/lib/media'
import { richTextToPlainText } from '@/lib/richTextToPlainText'
import { pageMetadata } from '@/lib/pageMetadata'
import type { CrossSellItem } from '@/lib/crossSell'
import type { Category, Product } from '@/payload-types'

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

function toCrossSellItem(p: Product): CrossSellItem {
  return {
    productId: String(p.id),
    productSlug: p.slug,
    name: p.name,
    price: p.price,
    imageUrl: mediaUrl(p.images?.[0], 'card'),
  }
}

const getRelatedProducts = cache(async (product: Product): Promise<CrossSellItem[]> => {
  const payload = await getPayloadClient()

  const explicitIds = (product.relatedProducts || [])
    .map((p) => (typeof p === 'object' && p !== null ? p.id : p))
    .filter((id): id is number => typeof id === 'number')

  if (explicitIds.length > 0) {
    // Re-fetch at depth 1 so the related products' own images are populated
    // (the parent query only reaches them as bare relationships).
    const related = await payload.find({
      collection: 'products',
      where: { and: [{ _status: { equals: 'published' } }, { id: { in: explicitIds } }] },
      depth: 1,
      limit: explicitIds.length,
    })
    const byId = new Map(related.docs.map((d) => [d.id, d]))
    return explicitIds
      .map((id) => byId.get(id))
      .filter((d): d is Product => Boolean(d))
      .map(toCrossSellItem)
  }

  const fallback = await payload.find({
    collection: 'products',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { crossSell: { equals: true } },
        { id: { not_equals: product.id } },
      ],
    },
    depth: 1,
    limit: 4,
  })
  return fallback.docs.map(toCrossSellItem)
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
  const imageUrl = mediaUrl(product.images?.[0], 'full')

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

  const imageUrl = mediaUrl(product.images?.[0], 'full')
  const absoluteImageUrl = imageUrl ? new URL(imageUrl, SITE_URL).toString() : undefined
  const relatedProducts = await getRelatedProducts(product)

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
            const url = mediaUrl(img, 'full')
            const alt = (typeof img === 'object' && img?.alt) || product.name
            return url ? { url, alt } : null
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
      <RelatedProductsBlock items={relatedProducts} />
    </>
  )
}
