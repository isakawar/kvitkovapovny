import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'

import { CartProvider } from '@/lib/cart-context'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import './globals.css'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
  title: 'Kvitkova Povnya — підписка на квіти та букети',
  description: 'Підписка на квіти та разові букети з доставкою по Києву.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()
  const [siteSettings, crossSellResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
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

  return (
    <html lang="uk" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header logoUrl={mediaUrl(siteSettings.logo, 'card')} crossSellProducts={crossSellProducts} />
          <main className="flex-1">{children}</main>
          <Footer
            contactPhone={siteSettings.contactPhone}
            contactEmail={siteSettings.contactEmail}
            instagramUrl={siteSettings.instagramUrl}
          />
        </CartProvider>
      </body>
    </html>
  )
}
