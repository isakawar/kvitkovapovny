import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

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

  const [categories, products] = await Promise.all([
    payload.find({
      collection: 'categories',
      where: { _status: { equals: 'published' } },
      limit: 0,
      select: { slug: true },
    }),
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: 0,
      select: { slug: true },
    }),
  ])

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...categories.docs.map((c) => ({ url: `${SITE_URL}/katalog/${c.slug}` })),
    ...products.docs.map((p) => ({ url: `${SITE_URL}/product/${p.slug}` })),
  ]
}
