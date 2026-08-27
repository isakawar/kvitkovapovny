import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/pageMetadata'

import { getPayloadClient } from '@/lib/payload'
import { Hero } from '@/components/storefront/Hero'
import { SubscriptionExplainer } from '@/components/storefront/SubscriptionExplainer'
import { FormatsGrid } from '@/components/storefront/FormatsGrid'
import { FeatureStrip } from '@/components/storefront/FeatureStrip'
import { WeddingPromo } from '@/components/storefront/WeddingPromo'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { InstagramFeed } from '@/components/storefront/InstagramFeed'
import { TestimonialsCarousel } from '@/components/storefront/TestimonialsCarousel'
import { FaqAccordion } from '@/components/storefront/FaqAccordion'
import { HowItWorks } from '@/components/storefront/HowItWorks'
import {
  SubscriptionConfigurator,
  type SubscriptionConfiguratorProduct,
} from '@/components/storefront/SubscriptionConfigurator'
import { SUBSCRIPTION_CONFIGURATOR_ID } from '@/components/storefront/subscriptionConfiguratorId'
import { mediaUrl } from '@/lib/media'
import { getInstagramFeed } from '@/lib/instagram'

export const metadata: Metadata = pageMetadata({ path: '/' })

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [
    hero,
    siteSettings,
    subscriptionInfo,
    weddingPage,
    formatsSection,
    featureStrip,
    howItWorksSection,
    subscriptionPricing,
    testimonials,
    faqSection,
    featuredProducts,
    subscriptionCategory,
    instagramPosts,
  ] = await Promise.all([
    payload.findGlobal({ slug: 'hero' }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'subscription-info' }),
    payload.findGlobal({ slug: 'wedding-page' }),
    payload.findGlobal({ slug: 'formats-section' }),
    payload.findGlobal({ slug: 'feature-strip' }),
    payload.findGlobal({ slug: 'how-it-works-section' }),
    payload.findGlobal({ slug: 'subscription-pricing' }),
    payload.findGlobal({ slug: 'testimonials' }),
    payload.findGlobal({ slug: 'faq-section' }),
    payload.find({
      collection: 'products',
      where: { and: [{ _status: { equals: 'published' } }, { featured: { equals: true } }] },
      sort: 'sortOrder',
      limit: 8,
    }),
    payload.find({ collection: 'categories', where: { slug: { equals: 'pidpyska' } }, limit: 1 }),
    getInstagramFeed(),
  ])

  const theme = siteSettings.designTheme || 'old'

  const configuratorSourceProduct = subscriptionCategory.docs[0]
    ? (
        await payload.find({
          collection: 'products',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { categories: { in: [subscriptionCategory.docs[0].id] } },
              { highlighted: { equals: true } },
            ],
          },
          limit: 1,
        })
      ).docs[0]
    : undefined

  const configuratorProduct: SubscriptionConfiguratorProduct | null = configuratorSourceProduct
    ? {
        productId: String(configuratorSourceProduct.id),
        slug: configuratorSourceProduct.slug,
        name: configuratorSourceProduct.name,
        images: (configuratorSourceProduct.images || [])
          .map((img) => {
            const url = mediaUrl(img.image, 'full')
            return url ? { url, alt: img.alt || configuratorSourceProduct.name } : null
          })
          .filter((img): img is { url: string; alt: string } => img !== null),
        sizes: (configuratorSourceProduct.variants || []).map((v) => {
          const gallery = (subscriptionPricing.sizes || []).find((s) => s.label === v.label)
          return {
            label: v.label,
            price: configuratorSourceProduct.price + (v.priceModifier ?? 0),
            badge: v.recommended ? 'Хіт' : undefined,
            images: [...(gallery?.images || [])]
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((img) => {
                const url = mediaUrl(img.image, 'full')
                return url ? { url, alt: img.alt || `${v.label} — ${configuratorSourceProduct.name}` } : null
              })
              .filter((img): img is { url: string; alt: string } => img !== null),
          }
        }),
        deliveryFrequencies: (configuratorSourceProduct.deliveryFrequencies || []).map((f) => f.label),
      }
    : null

  return (
    <>
      <Hero
        theme={theme}
        heading={hero.heading}
        subheading={hero.subheading}
        videoUrl={mediaUrl(hero.video)}
        fallbackImageUrl={mediaUrl(hero.fallbackImage)}
        fallbackImageAlt={hero.heading}
        ctaButtons={(hero.ctaButtons || []).map((cta) => ({
          label: cta.label,
          href: cta.href,
          style: cta.style,
        }))}
      />

      {theme === 'new' && (
        <FeatureStrip
          heading={featureStrip.heading}
          items={(featureStrip.items || []).map((item) => ({
            icon: item.icon,
            title: item.title,
            description: item.description,
          }))}
          cta={featureStrip.cta}
        />
      )}

      {theme === 'new' && (
        <HowItWorks
          heading={howItWorksSection.heading}
          steps={(howItWorksSection.steps || []).map((step) => ({
            icon: step.icon,
            title: step.title,
            subtitle: step.subtitle,
          }))}
        />
      )}

      {theme === 'new' && configuratorProduct && (
        <SubscriptionConfigurator id={SUBSCRIPTION_CONFIGURATOR_ID} product={configuratorProduct} />
      )}

      <FormatsGrid
        theme={theme}
        heading={theme === 'new' ? formatsSection.heading : null}
        cards={[...(formatsSection.cards || [])]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((card) => ({
            title: card.title,
            subtitle: card.subtitle,
            buttonLabel: card.buttonLabel,
            buttonHref: card.buttonHref,
            imageUrl: mediaUrl(card.image, 'card'),
          }))}
      />

      <SubscriptionExplainer
        theme={theme}
        heading={subscriptionInfo.heading}
        intro={subscriptionInfo.intro}
        imageUrl={mediaUrl(subscriptionInfo.image, 'full')}
        frequenciesHeading={subscriptionInfo.frequenciesHeading}
        frequencies={subscriptionInfo.frequencies || []}
        minimumHeading={subscriptionInfo.minimumHeading}
        minimumIncludes={subscriptionInfo.minimumIncludes || []}
        eachDeliveryHeading={subscriptionInfo.eachDeliveryHeading}
        eachDeliveryIncludes={subscriptionInfo.eachDeliveryIncludes || []}
        ctaLabel={subscriptionInfo.ctaLabel}
        ctaHref={subscriptionInfo.ctaHref}
      />

      <WeddingPromo imageUrl={mediaUrl(weddingPage.coverImage, 'full')} heading={weddingPage.heading} />

      <ProductGrid
        title="Популярне"
        products={featuredProducts.docs.map((p) => ({
          productId: String(p.id),
          slug: p.slug,
          name: p.name,
          price: p.price,
          imageUrl: mediaUrl(p.images?.[0]?.image, 'card'),
          imageAlt: p.images?.[0]?.alt || p.name,
          inStock: p.inStock ?? true,
          freeDeliveryBadge: p.freeDeliveryBadge,
          vaseGiftBadge: p.vaseGiftBadge,
        }))}
      />

      <TestimonialsCarousel
        testimonials={(testimonials.testimonials || [])
          .map((t) => {
            const imageUrl = mediaUrl(t.image, 'card')
            return imageUrl ? { imageUrl, authorName: t.authorName } : null
          })
          .filter((t) => t !== null)}
        rating={testimonials.googleRating}
        statText={testimonials.happySubscribersStat}
        instagramUrl={siteSettings.instagramUrl}
      />

      <InstagramFeed instagramUrl={siteSettings.instagramUrl} posts={instagramPosts} />

      <FaqAccordion items={(faqSection.faqItems || []).map((item) => ({ question: item.question, answer: item.answer }))} />
    </>
  )
}
