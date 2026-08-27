import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/pageMetadata'

import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = pageMetadata({
  path: '/contacts',
  title: 'Контакти | Kvitkova Povnya',
  description: 'Телефон, адреса шоуруму та соцмережі Kvitkova Povnya — квіткова підписка та букети з доставкою по Києву.',
})

export default async function ContactsPage() {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })

  const cities = (siteSettings.deliveryCities || []).filter((c) => c.active !== false)
  const mapsHref =
    siteSettings.googleMapsUrl ||
    (siteSettings.showroomAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteSettings.showroomAddress)}`
      : null)
  const mapsEmbedSrc = siteSettings.showroomAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(siteSettings.showroomAddress)}&output=embed`
    : null

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-ink">Контакти</h1>
      <div className="space-y-3 text-sm text-ink">
        {siteSettings.contactPhone && (
          <p>
            Телефон:{' '}
            <a href={`tel:${siteSettings.contactPhone}`} className="text-accent underline">
              {siteSettings.contactPhone}
            </a>
          </p>
        )}
        {siteSettings.contactEmail && (
          <p>
            Email:{' '}
            <a href={`mailto:${siteSettings.contactEmail}`} className="text-accent underline">
              {siteSettings.contactEmail}
            </a>
          </p>
        )}
        {siteSettings.instagramUrl && (
          <p>
            Instagram:{' '}
            <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">
              {siteSettings.instagramUrl}
            </a>
          </p>
        )}
        {siteSettings.showroomAddress && (
          <p>
            Адреса:{' '}
            {mapsHref ? (
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="text-[#9EAF00] underline">
                {siteSettings.showroomAddress}
              </a>
            ) : (
              siteSettings.showroomAddress
            )}
          </p>
        )}
        {cities.length > 0 && (
          <p>Доставляємо: {cities.map((c) => c.name).join(', ')}</p>
        )}
      </div>

      {mapsEmbedSrc && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10">
          <iframe
            src={mapsEmbedSrc}
            title="Ми на карті"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full border-0 sm:h-96"
          />
        </div>
      )}
    </div>
  )
}
