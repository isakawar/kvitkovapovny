import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const ALLOW = ['/', '/api/media/']
const DISALLOW = ['/admin', '/api/', '/checkout', '/cart', '/order']

const ALLOWED_AGENTS = ['Googlebot', 'Bingbot', 'GPTBot', 'PerplexityBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: ALLOW, disallow: DISALLOW },
      ...ALLOWED_AGENTS.map((userAgent) => ({ userAgent, allow: ALLOW, disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
