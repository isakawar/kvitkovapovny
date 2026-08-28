import type { Metadata } from 'next'
import { Montserrat, Unbounded } from 'next/font/google'
import { GoogleTagManager } from '@next/third-parties/google'

import { CartProvider } from '@/lib/cart-context'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { TickerStrip } from '@/components/storefront/TickerStrip'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import './globals.css'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'cyrillic'],
})

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin', 'cyrillic'],
})

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kvitkova Povnya — підписка на квіти та букети',
    template: '%s',
  },
  description: 'Підписка на квіти та разові букети з доставкою по Києву.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()
  const [siteSettings, subscriptionInfo, crossSellResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'subscription-info' }),
    payload.find({
      collection: 'products',
      where: { and: [{ _status: { equals: 'published' } }, { crossSell: { equals: true } }] },
      limit: 4,
    }),
  ])

  const crossSellProducts = crossSellResult.docs.map((p) => ({
    productId: String(p.id),
    productSlug: p.slug,
    name: p.name,
    price: p.price,
    imageUrl: mediaUrl(p.images?.[0]?.image, 'thumbnail'),
  }))

  const logoUrl = mediaUrl(siteSettings.logo, 'card')
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    name: 'Kvitkova Povnya',
    url: SITE_URL,
    logo: logoUrl ? new URL(logoUrl, SITE_URL).toString() : undefined,
    image: logoUrl ? new URL(logoUrl, SITE_URL).toString() : undefined,
    telephone: siteSettings.contactPhone || undefined,
    email: siteSettings.contactEmail || undefined,
    address: siteSettings.showroomAddress
      ? { '@type': 'PostalAddress', streetAddress: siteSettings.showroomAddress, addressLocality: 'Київ', addressCountry: 'UA' }
      : undefined,
    sameAs: [siteSettings.instagramUrl, siteSettings.telegramUrl, siteSettings.tiktokUrl, siteSettings.threadsUrl].filter(
      (url): url is string => Boolean(url),
    ),
  }

  return (
    <html
      lang="uk"
      data-theme={siteSettings.designTheme || 'old'}
      className={`${montserrat.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <>
            <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <CartProvider>
          {subscriptionInfo.tickerText && <TickerStrip text={subscriptionInfo.tickerText} />}
          <Header
            theme={siteSettings.designTheme || 'old'}
            logoUrl={mediaUrl(siteSettings.logo, 'card')}
            crossSellProducts={crossSellProducts}
          />
          <main className="flex-1">{children}</main>
          <Footer
            contactPhone={siteSettings.contactPhone}
            contactEmail={siteSettings.contactEmail}
            instagramUrl={siteSettings.instagramUrl}
            telegramUrl={siteSettings.telegramUrl}
            tiktokUrl={siteSettings.tiktokUrl}
            threadsUrl={siteSettings.threadsUrl}
            showroomAddress={siteSettings.showroomAddress}
            googleMapsUrl={siteSettings.googleMapsUrl}
          />
        </CartProvider>
      </body>
    </html>
  )
}
