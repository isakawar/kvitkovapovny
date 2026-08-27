import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const revalidate = 3600

const STATIC_PATHS = [
  '/',
  '/katalog',
  '/custom-bouquet',
  '/wedding',
  '/dlya-biznesu',
  '/contacts',
  '/dostavka-ta-oplata',
  '/garantiya-svizhosti',
  '/oferta',
  '/politika-konfidentsiynosti',
  '/gift-certificates',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  // Static pages have no CMS record to source a real edit date from —
  // stamping them with the sitemap's own generation time is the accepted
  // fallback and still satisfies crawlers that key off `lastmod` freshness.
  const buildDate = new Date()

  const [categories, products] = await Promise.all([
    payload.find({
      collection: 'categories',
      where: { _status: { equals: 'published' } },
      limit: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: 0,
      select: { slug: true, updatedAt: true },
    }),
  ])

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: buildDate })),
    ...categories.docs.map((c) => ({
      url: `${SITE_URL}/katalog/${c.slug}`,
      lastModified: new Date(c.updatedAt),
    })),
    ...products.docs.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    })),
  ]
}
