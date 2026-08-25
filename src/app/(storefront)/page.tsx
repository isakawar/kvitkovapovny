import { getPayloadClient } from '@/lib/payload'
import { Hero } from '@/components/storefront/Hero'
import { TickerStrip } from '@/components/storefront/TickerStrip'
import { SubscriptionExplainer } from '@/components/storefront/SubscriptionExplainer'
import { FormatsGrid } from '@/components/storefront/FormatsGrid'
import { FeatureStrip } from '@/components/storefront/FeatureStrip'
import { HowItWorks } from '@/components/storefront/HowItWorks'
import { WeddingPromo } from '@/components/storefront/WeddingPromo'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { InstagramFeed } from '@/components/storefront/InstagramFeed'
import { TestimonialsGrid } from '@/components/storefront/TestimonialsGrid'
import { FaqAccordion } from '@/components/storefront/FaqAccordion'
import { mediaUrl } from '@/lib/media'
import { getInstagramFeed } from '@/lib/instagram'

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
    featuredProducts,
    instagramPosts,
  ] = await Promise.all([
    payload.findGlobal({ slug: 'hero' }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'subscription-info' }),
    payload.findGlobal({ slug: 'wedding-page' }),
    payload.findGlobal({ slug: 'formats-section' }),
    payload.findGlobal({ slug: 'feature-strip' }),
    payload.findGlobal({ slug: 'how-it-works-section' }),
    payload.find({
      collection: 'products',
      where: { and: [{ _status: { equals: 'published' } }, { featured: { equals: true } }] },
      sort: 'sortOrder',
      limit: 8,
    }),
    getInstagramFeed(),
  ])

  const theme = siteSettings.designTheme || 'old'

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
          items={(featureStrip.items || []).map((item) => ({
            icon: item.icon,
            title: item.title,
            subtitle: item.subtitle,
          }))}
        />
      )}

      {subscriptionInfo.tickerText && <TickerStrip text={subscriptionInfo.tickerText} />}

      <FormatsGrid
        theme={theme}
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

      <SubscriptionExplainer
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
          slug: p.slug,
          name: p.name,
          price: p.price,
          imageUrl: mediaUrl(p.images?.[0]?.image, 'card'),
          imageAlt: p.images?.[0]?.alt || p.name,
          inStock: p.inStock ?? true,
        }))}
      />

      <TestimonialsGrid
        testimonials={(siteSettings.testimonials || [])
          .map((t) => {
            const imageUrl = mediaUrl(t.image, 'card')
            return imageUrl ? { imageUrl, authorName: t.authorName } : null
          })
          .filter((t) => t !== null)}
      />

      <InstagramFeed instagramUrl={siteSettings.instagramUrl} posts={instagramPosts} />

      <FaqAccordion items={(siteSettings.faqItems || []).map((item) => ({ question: item.question, answer: item.answer }))} />
    </>
  )
}
