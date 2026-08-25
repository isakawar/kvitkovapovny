import { getPayloadClient } from '@/lib/payload'

export default async function ContactsPage() {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })

  const cities = (siteSettings.deliveryCities || []).filter((c) => c.active !== false)

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
        {cities.length > 0 && (
          <p>Доставляємо: {cities.map((c) => c.name).join(', ')}</p>
        )}
      </div>
    </div>
  )
}
