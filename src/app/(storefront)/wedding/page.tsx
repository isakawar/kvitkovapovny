import type { Metadata } from 'next'
import Image from 'next/image'

import { getPayloadClient } from '@/lib/payload'
import { WeddingInquiryForm } from '@/components/storefront/WeddingInquiryForm'
import { HowItWorks } from '@/components/storefront/HowItWorks'
import { mediaUrl } from '@/lib/media'

export const metadata: Metadata = {
  title: 'Весільна підписка на квіти | Kvitkova Povnya',
  description:
    'Створіть весільний фонд квітів разом із гостями та отримуйте свіжі букети щотижня протягом року.',
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
      <section className="relative flex h-[60vh] min-h-[400px] items-center justify-center overflow-hidden bg-ink">
        {coverUrl && <Image src={coverUrl} alt={weddingPage.heading} fill sizes="100vw" className="object-cover opacity-70" />}
        <div className="relative z-10 mx-4 flex max-w-xl flex-col items-center gap-5 text-center text-cream">
          <h1 className="text-3xl font-semibold tracking-wide sm:text-4xl">{weddingPage.heading}</h1>
          {weddingPage.subheading && <p className="text-base text-cream/90">{weddingPage.subheading}</p>}
          <a
            href="#wedding-form"
            className="inline-flex rounded-full bg-accent px-8 py-3 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
          >
            {weddingPage.ctaLabel || 'Залишити заявку'}
          </a>
        </div>
      </section>

      {weddingPage.steps && weddingPage.steps.length > 0 && (
        <HowItWorks heading="Як це працює" steps={weddingPage.steps} />
      )}

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
        <WeddingInquiryForm formHeading={weddingPage.formHeading} contactNote={weddingPage.contactNote} />
      </section>
    </div>
  )
}
