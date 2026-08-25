import type { Metadata } from 'next'
import Image from 'next/image'

import { getPayloadClient } from '@/lib/payload'
import { WeddingInquiryForm } from '@/components/storefront/WeddingInquiryForm'
import { mediaUrl } from '@/lib/media'

export const metadata: Metadata = {
  title: 'Весільні підписки та оформлення | Kvitkova Povnya',
  description: 'Індивідуальне квіткове оформлення весілля: арки, композиції, букет нареченої. Безкоштовна консультація.',
}

export default async function WeddingPage() {
  const payload = await getPayloadClient()
  const weddingPage = await payload.findGlobal({ slug: 'wedding-page' })

  const coverUrl = mediaUrl(weddingPage.coverImage, 'full')
  const gallery = (weddingPage.gallery || [])
    .map((item) => {
      const url = mediaUrl(item.image, 'card')
      return url ? { url, caption: item.caption } : null
    })
    .filter((item) => item !== null)

  return (
    <div>
      <section className="relative flex h-[50vh] min-h-[320px] items-center justify-center overflow-hidden bg-ink">
        {coverUrl && <Image src={coverUrl} alt={weddingPage.heading} fill sizes="100vw" className="object-cover opacity-70" />}
        <div className="relative z-10 mx-4 max-w-xl text-center text-cream">
          <h1 className="text-3xl font-semibold uppercase tracking-wide sm:text-4xl">{weddingPage.heading}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm whitespace-pre-line text-ink-soft">{weddingPage.intro}</p>
      </section>

      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {gallery.map((item, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-blush">
                <Image
                  src={item.url}
                  alt={item.caption || weddingPage.heading}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-2xl px-4 pb-20">
        <WeddingInquiryForm contactNote={weddingPage.contactNote} />
      </section>
    </div>
  )
}
