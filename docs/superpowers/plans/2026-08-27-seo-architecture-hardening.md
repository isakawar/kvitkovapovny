# SEO Architecture Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Push the storefront's technical-SEO baseline toward an 80+ health score: a sitemap with real `lastModified` dates, richer Product/Breadcrumb JSON-LD, hardened security headers with a clean bot-aware `robots.ts`, and guaranteed canonical/`og:url` parity on every page.

**Architecture:** All work is server-side Next.js App Router file-convention code (`app/sitemap.ts`, `app/robots.ts`, `next.config.ts`) plus per-page `generateMetadata`/`metadata` exports backed by Payload CMS queries. A new tiny helper (`src/lib/pageMetadata.ts`) centralizes canonical/`og:url` construction so every page emits the exact same string for both, instead of hand-rolling each one. No new dependencies, no database schema changes — `updatedAt` already exists on every Payload collection (Payload adds it automatically via `timestamps`).

**Tech Stack:** Next.js 16.3.2 (App Router), Payload CMS 3.88, TypeScript. No test runner is configured in this repo (`package.json` has no `test` script) — verification for each task uses `npm run lint`, `npm run build`, and manual `curl`/browser checks against `next dev` instead of automated tests.

**Spec:** User request (Ukrainian), reproduced here for reference:
1. Dynamic sitemap: every entity (Category, Product, static page) gets `lastModified` sourced from Payload's `updatedAt`.
2. Product page (`/product/[slug]`) JSON-LD: add `BreadcrumbList` (Home → Catalog → Category → Product name); enrich `Offer` with `priceCurrency: "UAH"`, `availability`, `shippingDetails`, `hasMerchantReturnPolicy`.
3. `next.config.js` security headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`. `robots.ts`: allow standard + AI bots (Googlebot, Bingbot, GPTBot, PerplexityBot), disallow `/api/` and `/admin/`.
4. Every page's canonical URL must match its `og:url` exactly (same www/trailing-slash form).

## Global Constraints

- Site URL comes from `process.env.NEXT_PUBLIC_SERVER_URL`, falling back to `http://localhost:3000` — every existing file that needs the origin already does this; keep the same pattern (`const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'`).
- Don't add a testing framework or write new automated tests — this repo has none, and adding one is out of scope. Verify with `npm run lint`, `npm run build`, and manual `curl` checks.
- Preserve existing behavior: `/checkout`, `/cart`, `/order` stay disallowed in `robots.ts` alongside the new `/api/` and `/admin/` rules — don't regress the existing protection.
- Follow the codebase's existing style: no comments unless explaining a non-obvious "why" (see the redirect-encoding comment in `next.config.ts` for the house style), single quotes, no semicolons in `src/**` files (semicolons ARE used in `next.config.ts` — match whichever file you're editing).
- Read `AGENTS.md` in the repo root before touching `app/sitemap.ts`, `app/robots.ts`, or `next.config.ts` — this project pins a Next.js version with docs at `node_modules/next/dist/docs/`; the `sitemap`, `robots`, and `headers` file-convention APIs were confirmed against those docs while writing this plan and match what's used below.

---

## File Structure

- Modify `src/app/sitemap.ts` — add `lastModified` per entry (Task 1).
- Modify `next.config.ts` — add `headers()` (Task 2).
- Modify `src/app/robots.ts` — bot-aware rules (Task 3).
- Modify `src/app/(storefront)/product/[productSlug]/page.tsx` — BreadcrumbList + enriched Offer (Task 4).
- Create `src/lib/pageMetadata.ts` — shared canonical/`og:url` builder (Task 5).
- Modify 12 page files to use the new helper so canonical and `og:url` are always the identical string (Task 5).

---

### Task 1: Sitemap `lastModified` from Payload `updatedAt`

**Files:**
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getPayloadClient()` from `@/lib/payload` (existing).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add `updatedAt` to the Payload selects and a shared build date**

Replace the full contents of `src/app/sitemap.ts` with:

```ts
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
```

- [ ] **Step 2: Verify types and build**

Run: `npm run lint && npm run build`
Expected: both succeed with no new errors. `payload.find`'s `select` accepts base fields like `updatedAt` (it's a standard Payload timestamp field), so no type errors are expected.

- [ ] **Step 3: Manual check against the dev server**

Run: `npm run dev` (in one terminal), then in another: `curl -s http://localhost:3000/sitemap.xml | grep -A1 lastmod | head -20`
Expected: every `<url>` entry has a `<lastmod>` tag; category/product URLs show real (non-identical-to-each-other, unless coincidentally saved at the same time) timestamps, static paths all show the same build timestamp. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): add lastModified to sitemap entries from Payload updatedAt"
```

---

### Task 2: Security headers in `next.config.ts`

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add a `headers()` function to the config object**

In `next.config.ts`, the `nextConfig` object currently ends its `redirects()` method at line 62 (`  },`) right before the closing `};` of the object (line 63). Add a `headers()` method right after `redirects()` returns, still inside the `nextConfig` object, so the object looks like:

```ts
  async redirects() {
    // ...unchanged...
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

(Note the double-quote style — `next.config.ts` uses double quotes and semicolons throughout, unlike `src/**`; match that.)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Manual header check against the dev server**

Run: `npm run dev`, then: `curl -sI http://localhost:3000/ | grep -i "strict-transport-security\|x-content-type-options\|referrer-policy"`
Expected: all three headers present with the exact values above. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat(seo): add HSTS, X-Content-Type-Options, and Referrer-Policy headers"
```

---

### Task 3: Bot-aware, clean `robots.ts`

**Files:**
- Modify: `src/app/robots.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Replace the rules with an explicit per-agent list**

Replace the full contents of `src/app/robots.ts` with:

```ts
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const DISALLOW = ['/admin/', '/api/', '/checkout', '/cart', '/order']

const ALLOWED_AGENTS = ['Googlebot', 'Bingbot', 'GPTBot', 'PerplexityBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...ALLOWED_AGENTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

This keeps the existing `/checkout`, `/cart`, `/order` protection (so private/transactional flows still aren't crawled), adds `/api/` and `/admin/` per the spec, and gives the four named crawlers (standard Googlebot/Bingbot plus the AI crawlers GPTBot and PerplexityBot) the same explicit allow so they're never accidentally caught by a future agent-specific rule added only to `*`.

- [ ] **Step 2: Verify types and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Manual check against the dev server**

Run: `npm run dev`, then: `curl -s http://localhost:3000/robots.txt`
Expected output shape (order may vary slightly but content must match):

```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /cart
Disallow: /order

User-Agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /cart
Disallow: /order

User-Agent: Bingbot
...

User-Agent: GPTBot
...

User-Agent: PerplexityBot
...

Sitemap: http://localhost:3000/sitemap.xml
```

Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add src/app/robots.ts
git commit -m "feat(seo): allow standard and AI crawlers explicitly, disallow /api/ and /admin/"
```

---

### Task 4: BreadcrumbList + enriched Offer schema on the product page

**Files:**
- Modify: `src/app/(storefront)/product/[productSlug]/page.tsx`

**Interfaces:**
- Consumes: `Category` type from `@/payload-types` (already generated); `product.categories` is typed `(number | Category)[]` there (relationship field, `hasMany: true`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Populate categories in the existing `getProduct` query**

In `src/app/(storefront)/product/[productSlug]/page.tsx`, find `getProduct`:

```ts
const getProduct = cache(async (productSlug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: { and: [{ slug: { equals: productSlug } }, { _status: { equals: 'published' } }] },
    limit: 1,
  })
  return result.docs[0]
})
```

Replace it with (adds `depth: 1` so `categories` resolves to populated `Category` objects instead of bare IDs):

```ts
const getProduct = cache(async (productSlug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: { and: [{ slug: { equals: productSlug } }, { _status: { equals: 'published' } }] },
    depth: 1,
    limit: 1,
  })
  return result.docs[0]
})
```

- [ ] **Step 2: Import the `Category` type**

Add to the top imports (after the existing `import { richTextToPlainText } ...` line):

```ts
import type { Category } from '@/payload-types'
```

- [ ] **Step 3: Build the breadcrumb and enrich the Offer in the page component**

Find the block in the default export, from `const jsonLd = {` through its closing `}` (currently lines ~58-71). Replace that whole block, and the two lines right before it (`const imageUrl = ...` / `const absoluteImageUrl = ...`, which stay unchanged), by inserting the new breadcrumb logic and expanding `jsonLd`. The full replacement for the section from `const imageUrl = mediaUrl(...)` down to the `return (` that follows:

```ts
  const imageUrl = mediaUrl(product.images?.[0]?.image, 'full')
  const absoluteImageUrl = imageUrl ? new URL(imageUrl, SITE_URL).toString() : undefined

  const firstCategory = (product.categories || []).find(
    (c): c is Category => typeof c === 'object' && c !== null,
  )
  const productDisplayName = product.pdpHeading || product.name

  const breadcrumbItems = [
    { name: 'Головна', url: SITE_URL },
    { name: 'Каталог', url: `${SITE_URL}/katalog` },
    ...(firstCategory ? [{ name: firstCategory.name, url: `${SITE_URL}/katalog/${firstCategory.slug}` }] : []),
    { name: productDisplayName, url: `${SITE_URL}/product/${product.slug}` },
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: richTextToPlainText(product.description) || undefined,
    image: absoluteImageUrl ? [absoluteImageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'UAH',
      price: (product.price / 100).toFixed(2),
      availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${SITE_URL}/product/${product.slug}`,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'UAH' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'UA' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'UA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 1,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  }

  return (
```

`shippingRate` is `0 UAH` and `returnPolicyCategory`/`merchantReturnDays: 1` because the site's actual policy (see `src/app/(storefront)/dostavka-ta-oplata/page.tsx` and the "Безкоштовна доставка по Києву" badge used across the storefront) is free citywide delivery, and refunds/exchanges are only guaranteed within 12 hours of delivery for damaged/incorrect items — `MerchantReturnFiniteReturnWindow` with `merchantReturnDays: 1` is the closest whole-day representation schema.org supports for a same-day window.

- [ ] **Step 4: Render the breadcrumb JSON-LD alongside the existing Product JSON-LD**

Find:

```tsx
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AddToCartForm
```

Replace with:

```tsx
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <AddToCartForm
```

- [ ] **Step 5: Also use `productDisplayName` where the old inline expression was used**

Find (inside the `AddToCartForm` props, unchanged otherwise):

```tsx
        name={product.pdpHeading || product.name}
```

Leave this line as-is — it's a separate prop with its own purpose (display heading on the page), not part of the JSON-LD. Do not replace it with `productDisplayName`; only the breadcrumb's last item uses `productDisplayName`. (This step is a no-op check, not an edit — confirm the line is untouched after Step 3-4's edits.)

- [ ] **Step 6: Verify types and build**

Run: `npm run lint && npm run build`
Expected: both succeed. If TypeScript complains that `Category` is unused or the narrowing predicate doesn't match, double check the import path is `@/payload-types` (matches the existing `import ... from '@/payload-types'` convention used elsewhere, e.g. `src/collections/*.ts` reference the same generated file).

- [ ] **Step 7: Manual check against the dev server**

Run: `npm run dev`, then pick any published product slug (check via `curl -s http://localhost:3000/sitemap.xml | grep -o '/product/[a-z0-9-]*' | head -1` if unsure) and run:
`curl -s http://localhost:3000/product/<slug> | grep -o '<script type="application/ld+json">.*</script>'`
Expected: two `application/ld+json` scripts — one `"@type":"Product"` with `offers.shippingDetails` and `offers.hasMerchantReturnPolicy` populated, one `"@type":"BreadcrumbList"` with 3-4 `ListItem`s ending in the product name. Stop the dev server after checking.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(storefront)/product/[productSlug]/page.tsx"
git commit -m "feat(seo): add BreadcrumbList schema and enrich Product Offer with shipping/return policy"
```

---

### Task 5: Guarantee canonical === `og:url` on every page

**Files:**
- Create: `src/lib/pageMetadata.ts`
- Modify: `src/app/(storefront)/page.tsx`
- Modify: `src/app/(storefront)/katalog/page.tsx`
- Modify: `src/app/(storefront)/katalog/[categorySlug]/page.tsx`
- Modify: `src/app/(storefront)/product/[productSlug]/page.tsx`
- Modify: `src/app/(storefront)/contacts/page.tsx`
- Modify: `src/app/(storefront)/wedding/page.tsx`
- Modify: `src/app/(storefront)/custom-bouquet/page.tsx`
- Modify: `src/app/(storefront)/dlya-biznesu/page.tsx`
- Modify: `src/app/(storefront)/dostavka-ta-oplata/page.tsx`
- Modify: `src/app/(storefront)/garantiya-svizhosti/page.tsx`
- Modify: `src/app/(storefront)/oferta/page.tsx`
- Modify: `src/app/(storefront)/politika-konfidentsiynosti/page.tsx`
- Modify: `src/app/(storefront)/gift-certificates/page.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (independent of Tasks 1-4; can be done in any order relative to them, but touches the same product/category page files as Task 4, so do Task 5 after Task 4 to avoid merge conflicts within this same working session).
- Produces: `pageMetadata({ path, title?, description? }): Metadata` from `src/lib/pageMetadata.ts` — every page in this task imports and uses it. `path` must be the site-relative canonical path (e.g. `/contacts`, `/product/${slug}`), never an absolute URL — the helper relies on `metadataBase` (set once in `src/app/(storefront)/layout.tsx`) to resolve both `alternates.canonical` and `openGraph.url` from the exact same relative string, which is what guarantees they match.

- [ ] **Step 1: Create the shared helper**

Why a helper instead of setting `openGraph.url` by hand on every page: two independently-typed strings (`/product/${slug}` for canonical, `${SITE_URL}/product/${slug}` for `og:url`, as the product page did before this task) can drift — e.g. one gains a trailing slash or a `www.` prefix and the other doesn't. Building both from one `path` argument makes that class of bug impossible instead of relying on reviewers to notice.

Create `src/lib/pageMetadata.ts`:

```ts
import type { Metadata } from 'next'

export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string
  title?: string
  description?: string
}): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url: path,
    },
  }
}
```

The conditional spreads matter: setting `title: undefined` explicitly (instead of omitting the key) would overwrite the root layout's default title (`Kvitkova Povnya — підписка на квіти та букети`, in `src/app/(storefront)/layout.tsx`) with a blank one on the homepage, which has no page-specific title today.

- [ ] **Step 2: Update the 9 static pages with a fixed title/description**

For each of the following files, find the existing `export const metadata: Metadata = { ... }` block and replace it with a call to `pageMetadata`, keeping the exact same `title`/`description` text and adding the import. Do not change any other exports in these files.

`src/app/(storefront)/contacts/page.tsx` — add `import { pageMetadata } from '@/lib/pageMetadata'` to the imports, replace:
```ts
export const metadata: Metadata = {
  title: 'Контакти | Kvitkova Povnya',
  description: 'Телефон, адреса шоуруму та соцмережі Kvitkova Povnya — квіткова підписка та букети з доставкою по Києву.',
  alternates: { canonical: '/contacts' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/contacts',
  title: 'Контакти | Kvitkova Povnya',
  description: 'Телефон, адреса шоуруму та соцмережі Kvitkova Povnya — квіткова підписка та букети з доставкою по Києву.',
})
```

`src/app/(storefront)/wedding/page.tsx` — replace:
```ts
export const metadata: Metadata = {
  title: 'Весільна підписка на квіти | Kvitkova Povnya',
  description:
    'Створіть весільний фонд квітів разом із гостями та отримуйте свіжі букети щотижня протягом року.',
  alternates: { canonical: '/wedding' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/wedding',
  title: 'Весільна підписка на квіти | Kvitkova Povnya',
  description: 'Створіть весільний фонд квітів разом із гостями та отримуйте свіжі букети щотижня протягом року.',
})
```

`src/app/(storefront)/custom-bouquet/page.tsx` — replace:
```ts
export const metadata: Metadata = {
  title: 'Зібрати букет самостійно | Kvitkova Povnya',
  description: 'Складіть авторський букет самостійно: оберіть квіти, кольори та упаковку з доставкою по Києву.',
  alternates: { canonical: '/custom-bouquet' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/custom-bouquet',
  title: 'Зібрати букет самостійно | Kvitkova Povnya',
  description: 'Складіть авторський букет самостійно: оберіть квіти, кольори та упаковку з доставкою по Києву.',
})
```

`src/app/(storefront)/dlya-biznesu/page.tsx` — replace:
```ts
export const metadata: Metadata = {
  title: 'Квіти для бізнесу | Kvitkova Povnya',
  description:
    'Автоматична підписка на живі квіти для закладів та офісів у Києві: повне обслуговування, вази, закриваючі документи.',
  alternates: { canonical: '/dlya-biznesu' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/dlya-biznesu',
  title: 'Квіти для бізнесу | Kvitkova Povnya',
  description:
    'Автоматична підписка на живі квіти для закладів та офісів у Києві: повне обслуговування, вази, закриваючі документи.',
})
```

`src/app/(storefront)/dostavka-ta-oplata/page.tsx` — replace:
```ts
export const metadata: Metadata = {
  title: 'Доставка та оплата | Kvitkova Povnya',
  description: 'Умови доставки квіткових підписок і букетів та способи оплати.',
  alternates: { canonical: '/dostavka-ta-oplata' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/dostavka-ta-oplata',
  title: 'Доставка та оплата | Kvitkova Povnya',
  description: 'Умови доставки квіткових підписок і букетів та способи оплати.',
})
```

`src/app/(storefront)/garantiya-svizhosti/page.tsx` — replace:
```ts
export const metadata: Metadata = {
  title: 'Гарантія свіжості | Kvitkova Povnya',
  description: 'Гарантія свіжості квітів у підписках і букетах Kvitkova Povnya.',
  alternates: { canonical: '/garantiya-svizhosti' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/garantiya-svizhosti',
  title: 'Гарантія свіжості | Kvitkova Povnya',
  description: 'Гарантія свіжості квітів у підписках і букетах Kvitkova Povnya.',
})
```

`src/app/(storefront)/oferta/page.tsx` — replace:
```ts
export const metadata: Metadata = {
  title: 'Договір оферти | Kvitkova Povnya',
  description: 'Публічна оферта на продаж квіткових підписок і букетів Kvitkova Povnya.',
  alternates: { canonical: '/oferta' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/oferta',
  title: 'Договір оферти | Kvitkova Povnya',
  description: 'Публічна оферта на продаж квіткових підписок і букетів Kvitkova Povnya.',
})
```

`src/app/(storefront)/politika-konfidentsiynosti/page.tsx` — replace:
```ts
export const metadata: Metadata = {
  title: 'Політика конфіденційності | Kvitkova Povnya',
  description: 'Політика конфіденційності та обробки персональних даних Kvitkova Povnya.',
  alternates: { canonical: '/politika-konfidentsiynosti' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/politika-konfidentsiynosti',
  title: 'Політика конфіденційності | Kvitkova Povnya',
  description: 'Політика конфіденційності та обробки персональних даних Kvitkova Povnya.',
})
```

`src/app/(storefront)/gift-certificates/page.tsx` — replace:
```ts
export const metadata: Metadata = {
  title: 'Подарунковий сертифікат | Kvitkova Povnya',
  description: 'Елегантний бокс із подарунковим сертифікатом на квіткову підписку для близьких.',
  alternates: { canonical: '/gift-certificates' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/gift-certificates',
  title: 'Подарунковий сертифікат | Kvitkova Povnya',
  description: 'Елегантний бокс із подарунковим сертифікатом на квіткову підписку для близьких.',
})
```

For all 9 files above, add the import line `import { pageMetadata } from '@/lib/pageMetadata'` next to the existing `import type { Metadata } from 'next'` line.

- [ ] **Step 3: Update the homepage (no title/description override today)**

In `src/app/(storefront)/page.tsx`, add the import and replace:
```ts
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({ path: '/' })
```

- [ ] **Step 4: Update the catalog root page**

In `src/app/(storefront)/katalog/page.tsx`, add the import and replace:
```ts
export const metadata: Metadata = {
  title: 'Каталог товарів | Kvitkova Povnya',
  description: 'Усі букети, підписки на квіти та товари Kvitkova Povnya в одному каталозі.',
  alternates: { canonical: '/katalog' },
}
```
with:
```ts
export const metadata: Metadata = pageMetadata({
  path: '/katalog',
  title: 'Каталог товарів | Kvitkova Povnya',
  description: 'Усі букети, підписки на квіти та товари Kvitkova Povnya в одному каталозі.',
})
```

- [ ] **Step 5: Update the category page's `generateMetadata`**

In `src/app/(storefront)/katalog/[categorySlug]/page.tsx`, add `import { pageMetadata } from '@/lib/pageMetadata'` to the imports. Replace the body of `generateMetadata`:

```ts
  return {
    title,
    description,
    alternates: { canonical: `/katalog/${category.slug}` },
    openGraph: { title, description, url: `/katalog/${category.slug}` },
  }
```

with:

```ts
  return pageMetadata({ path: `/katalog/${category.slug}`, title, description })
```

(This is behavior-preserving: it already used a relative `url`, so this only removes duplication — no functional change to what's rendered.)

- [ ] **Step 6: Update the product page's `generateMetadata`**

In `src/app/(storefront)/product/[productSlug]/page.tsx`, add `import { pageMetadata } from '@/lib/pageMetadata'` to the imports. This page's `openGraph` previously used an absolute `${SITE_URL}/product/${product.slug}` URL while `canonical` used the relative `/product/${product.slug}` — replace the whole `generateMetadata` return block:

```ts
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${product.slug}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  }
```

with:

```ts
  const base = pageMetadata({ path: `/product/${product.slug}`, title, description })
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  }
```

This is the fix for the actual canonical/`og:url` mismatch risk called out in the spec: before this change, canonical resolved via `metadataBase` (relative path) while `og:url` was hand-built from `SITE_URL` — if those two ever disagreed on trailing slash or `www.`, the tags would mismatch. After this change both come from the same `path` string.

- [ ] **Step 7: Verify types and build**

Run: `npm run lint && npm run build`
Expected: both succeed with no errors across all 14 touched files.

- [ ] **Step 8: Manual check — confirm canonical and og:url match on a sample of pages**

Run: `npm run dev`, then for each of `/`, `/katalog`, `/contacts`, and one real product URL (from the sitemap, as in Task 4 Step 7) and one real category URL (e.g. `/katalog/pidpyska` or `/katalog/buket` — check `curl -s http://localhost:3000/sitemap.xml | grep -o '/katalog/[a-z-]*'` if unsure):

```bash
curl -s http://localhost:3000/<path> | grep -Eo '<link rel="canonical" href="[^"]*"|<meta property="og:url" content="[^"]*"'
```

Expected: for every URL checked, the value inside `canonical`'s `href="..."` and `og:url`'s `content="..."` is byte-for-byte identical. Stop the dev server after checking.

- [ ] **Step 9: Commit**

```bash
git add src/lib/pageMetadata.ts \
  "src/app/(storefront)/page.tsx" \
  "src/app/(storefront)/katalog/page.tsx" \
  "src/app/(storefront)/katalog/[categorySlug]/page.tsx" \
  "src/app/(storefront)/product/[productSlug]/page.tsx" \
  "src/app/(storefront)/contacts/page.tsx" \
  "src/app/(storefront)/wedding/page.tsx" \
  "src/app/(storefront)/custom-bouquet/page.tsx" \
  "src/app/(storefront)/dlya-biznesu/page.tsx" \
  "src/app/(storefront)/dostavka-ta-oplata/page.tsx" \
  "src/app/(storefront)/garantiya-svizhosti/page.tsx" \
  "src/app/(storefront)/oferta/page.tsx" \
  "src/app/(storefront)/politika-konfidentsiynosti/page.tsx" \
  "src/app/(storefront)/gift-certificates/page.tsx"
git commit -m "feat(seo): guarantee canonical and og:url match via shared pageMetadata helper"
```

---

## Self-Review Notes

- **Spec coverage:** (1) sitemap `lastModified` → Task 1. (2) BreadcrumbList + enriched Offer → Task 4. (3) security headers + bot-aware robots → Tasks 2 & 3. (4) canonical/`og:url` parity → Task 5. All four spec items have a task.
- **Placeholder scan:** no TBD/TODO markers; every step has literal code.
- **Type consistency:** `pageMetadata` signature (`{ path, title?, description? }`) is used identically in Tasks 5 across all 12 call sites; `Category` type and `firstCategory` narrowing in Task 4 match the generated `src/payload-types.ts` shape (`categories: (number | Category)[]`).
