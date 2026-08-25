# New-Theme Homepage Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage layout for `designTheme: 'new'` to match
the client's reference (two-column hero, feature strip, restyled format
cards, a new "how it works" section), while leaving `designTheme: 'old'`
pixel-identical to today.

**Architecture:** Components with structurally different markup between
themes (`Header`, `Hero`, `FormatsGrid`) get a new `theme: 'old' | 'new'`
prop and branch their JSX server-side — no CSS-toggle duplication, no
client JS. Two new Payload globals (`FeatureStrip`,
`HowItWorksSection`) back two brand-new components that render only
when `theme === 'new'`. A shared inline-SVG icon set
(`HomeIcons.tsx`) backs both new globals' admin-selectable `icon`
field.

**Tech Stack:** Next.js 16 (App Router, RSC), Payload CMS 3
(Postgres), Tailwind CSS v4, TypeScript. No test framework in this
repo — verify via `npx tsc --noEmit`, `npm run lint`, and manual
browser QA on the dev server.

**Spec:** `docs/superpowers/specs/2026-08-25-new-theme-homepage-design.md`
(and the prior `docs/superpowers/specs/2026-08-25-rebrand-theme-toggle-design.md`
for the `designTheme` toggle this plan builds on).

## Global Constraints

- `designTheme: 'old'` must stay pixel-identical to today's site —
  every branch added by this plan defaults to reproducing the exact
  current JSX/classes for the old-theme path.
- New homepage sections (`FeatureStrip`, `HowItWorks`) render **only**
  when `theme === 'new'` — they do not exist in the old theme at all.
- Header search/account/wishlist icons are **visual only** — no
  `href`, no click handler, no page they navigate to.
- Hero drops video support in the new theme (the `video` field stays
  in the `Hero` global's schema for the old theme; the new theme's
  branch never reads it).
- No new npm dependencies. No icon library — icons are inline SVG.
- Every new Payload global's `afterChange` hook uses
  `revalidatePath('/', 'layout')` (matches the fix already applied to
  `site-settings` — invalidates every route under the root layout in
  one call, not just `/`).
- A migration for each new Payload global/field is part of this plan,
  generated via `npm run payload migrate:create` against a scratch
  Postgres and verified with `up`/`migrate:status`/`down` — do not
  defer this to a follow-up fix (this repo runs `payload migrate` in
  production with `push` disabled per `src/payload.config.ts`).

---

## File Structure

- Create: `src/globals/FeatureStrip.ts` — Payload global, 3-4 icon+title+subtitle items.
- Create: `src/globals/HowItWorksSection.ts` — Payload global, heading + 3-5 numbered steps.
- Modify: `src/payload.config.ts` — register both new globals.
- Create: `src/migrations/<timestamp>_add_feature_strip_and_how_it_works.ts` (+ matching `.json` snapshot) — adds both new tables/enums.
- Modify: `src/migrations/index.ts` — register the new migration.
- Modify: `src/payload-types.ts` — regenerated types (committed, not hand-edited).
- Create: `src/components/storefront/HomeIcons.tsx` — shared `HomeIcon` component + `HomeIconName` type, 6 inline-SVG icons.
- Create: `src/components/storefront/FeatureStrip.tsx` — renders `FeatureStrip.items`.
- Create: `src/components/storefront/HowItWorks.tsx` — renders `HowItWorksSection.heading` + `.steps`.
- Modify: `src/components/storefront/Hero.tsx` — add `theme` prop, new two-column branch.
- Modify: `src/components/storefront/FormatsGrid.tsx` — add `theme` prop, new card-style branch.
- Modify: `src/components/storefront/Header.tsx` — add `theme` prop, new icon row.
- Modify: `src/app/(storefront)/layout.tsx` — pass `theme` to `Header`.
- Modify: `src/app/(storefront)/page.tsx` — fetch the two new globals, pass `theme` to `Hero`/`FormatsGrid`, conditionally render `FeatureStrip`/`HowItWorks`.

No other files change. `TestimonialsGrid`, `InstagramFeed`,
`TickerStrip`, `SubscriptionExplainer`, `WeddingPromo`, `ProductGrid`,
`FaqAccordion` are unmodified — per spec, they already repaint via CSS
tokens and get no structural changes in this plan.

---

## Task 1: `FeatureStrip` and `HowItWorksSection` Payload globals + migration

**Files:**
- Create: `src/globals/FeatureStrip.ts`
- Create: `src/globals/HowItWorksSection.ts`
- Modify: `src/payload.config.ts:33` (the `globals` array)
- Create: `src/migrations/<timestamp>_add_feature_strip_and_how_it_works.ts` and matching `.json`
- Modify: `src/migrations/index.ts`
- Modify: `src/payload-types.ts` (regenerated, committed)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: Payload globals `feature-strip` (shape
  `{ items: { icon: 'truck'|'vase'|'pause'|'flower'|'home'|'sparkle', title: string, subtitle?: string }[] }`)
  and `how-it-works-section` (shape
  `{ heading: string, steps: { icon: same union, title: string, subtitle?: string }[] }`),
  both readable via `payload.findGlobal({ slug: '...' })`. Consumed by
  Task 8 (`page.tsx`).

- [ ] **Step 1: Create `src/globals/FeatureStrip.ts`**

```ts
import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

const iconOptions = [
  { label: 'Доставка', value: 'truck' },
  { label: 'Ваза', value: 'vase' },
  { label: 'Пауза', value: 'pause' },
  { label: 'Квітка', value: 'flower' },
  { label: 'Дім', value: 'home' },
  { label: 'Зірка', value: 'sparkle' },
]

export const FeatureStrip: GlobalConfig = {
  slug: 'feature-strip',
  label: 'Стрічка переваг',
  admin: {
    group: 'Контент сайту',
    description: 'Ряд із 3 переваг з іконками під головним банером (лише в новому дизайні)',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      defaultValue: [
        { icon: 'truck', title: 'Безкоштовна доставка по Києву' },
        { icon: 'vase', title: 'Ваза та секатор у подарунок' },
        { icon: 'pause', title: 'Можливість паузи підписки' },
      ],
      fields: [
        { name: 'icon', type: 'select', required: true, options: iconOptions },
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath('/', 'layout')
        } catch {
          // No-op outside a Next.js request context (e.g. seed scripts).
        }
        return doc
      },
    ],
  },
}
```

- [ ] **Step 2: Create `src/globals/HowItWorksSection.ts`**

```ts
import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

const iconOptions = [
  { label: 'Доставка', value: 'truck' },
  { label: 'Ваза', value: 'vase' },
  { label: 'Пауза', value: 'pause' },
  { label: 'Квітка', value: 'flower' },
  { label: 'Дім', value: 'home' },
  { label: 'Зірка', value: 'sparkle' },
]

export const HowItWorksSection: GlobalConfig = {
  slug: 'how-it-works-section',
  label: 'Блок "Як це працює"',
  admin: {
    group: 'Контент сайту',
    description: 'Заголовок і пронумеровані кроки (лише в новому дизайні)',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Як це працює',
    },
    {
      name: 'steps',
      type: 'array',
      minRows: 1,
      maxRows: 5,
      defaultValue: [
        { icon: 'flower', title: 'Обираєте тариф', subtitle: 'Розмір букета, частота та день доставки' },
        { icon: 'vase', title: 'Отримуєте подарунки', subtitle: 'Ваза, секатор, інструкція по догляду' },
        { icon: 'sparkle', title: 'Насолоджуєтесь', subtitle: 'Свіжі квіти у вашому домі щотижня' },
      ],
      fields: [
        { name: 'icon', type: 'select', required: true, options: iconOptions },
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath('/', 'layout')
        } catch {
          // No-op outside a Next.js request context (e.g. seed scripts).
        }
        return doc
      },
    ],
  },
}
```

- [ ] **Step 3: Register both globals in `src/payload.config.ts`**

Add imports near the existing global imports (find where `FormatsSection`
is imported and follow the same relative-path pattern), and change line 33
from:

```ts
  globals: [Hero, SiteSettings, SubscriptionInfo, WeddingPage, FormatsSection, InstagramIntegration],
```

to:

```ts
  globals: [Hero, SiteSettings, SubscriptionInfo, WeddingPage, FormatsSection, InstagramIntegration, FeatureStrip, HowItWorksSection],
```

- [ ] **Step 4: Regenerate types**

Run: `node --env-file=.env --import tsx scripts/generate-types.mjs`

Confirm `src/payload-types.ts` now contains a `FeatureStrip` interface
(with `items: { icon: ...; title: string; subtitle?: string | null }[]`)
and a `HowItWorksSection` interface (with `heading: string; steps: [...]`).

- [ ] **Step 5: Generate and verify the migration**

Ensure a scratch Postgres is reachable (reuse the same approach as the
prior branch's migration fix: a disposable Docker Postgres container,
or the existing local dev Postgres if you're certain it's disposable —
check `.env`'s `DATABASE_URI` first). Run:

```bash
npm run payload migrate:create add_feature_strip_and_how_it_works
```

Open the generated `src/migrations/<timestamp>_add_feature_strip_and_how_it_works.ts`
and confirm it contains, in its `up` function: two `CREATE TYPE` statements
for the new `icon` enums (one per global, following the naming convention
of existing `enum_*` types in `src/migrations/20260825_103829_initial_schema.ts`
— e.g. `enum_feature_strip_items_icon` and
`enum_how_it_works_section_steps_icon`), and `CREATE TABLE` statements for
`feature_strip`, `feature_strip_items`, `how_it_works_section`, and
`how_it_works_section_steps` (array sub-tables follow the same
`_order`/`_parent_id` pattern visible in `20260825_103829_initial_schema.ts`'s
`users_sessions` table). Confirm the `down` function reverses all of it
(drop tables, then drop the two enum types).

If `payload migrate:create` produces no usable output (a known
possible issue with this repo's CLI/tsx interaction — see
`scripts/generate-types.mjs`'s comment for context), hand-write the
migration file yourself following the exact structure of
`src/migrations/20260825_103829_initial_schema.ts` (raw SQL via
`db.execute(sql\`...\`)`, `MigrateUpArgs`/`MigrateDownArgs` from
`@payloadcms/db-postgres`).

Verify by running the migration against your scratch Postgres:

```bash
DATABASE_URI=<scratch-db-uri> PAYLOAD_USE_MIGRATIONS=true npx cross-env NODE_OPTIONS=--no-deprecation payload migrate
DATABASE_URI=<scratch-db-uri> PAYLOAD_USE_MIGRATIONS=true npx cross-env NODE_OPTIONS=--no-deprecation payload migrate:status
DATABASE_URI=<scratch-db-uri> PAYLOAD_USE_MIGRATIONS=true npx cross-env NODE_OPTIONS=--no-deprecation payload migrate:down
```

Confirm `up` succeeds, `migrate:status` shows the new migration as
applied, and `migrate:down` cleanly reverses it (no leftover tables/types).
If you cannot run this against a live database in your environment,
say so explicitly when you report and explain what you verified
instead (SQL syntax correctness, naming convention match).

- [ ] **Step 6: Register the migration**

Edit `src/migrations/index.ts` to import the new migration module and
add `{ up: ..., down: ..., name: '<timestamp>_add_feature_strip_and_how_it_works' }`
to the `migrations` array, after the existing entry — follow the
exact pattern already there for `20260825_103829_initial_schema`.

- [ ] **Step 7: Typecheck and lint**

Run: `npx tsc --noEmit` and `npm run lint`
Expected: no new errors.

- [ ] **Step 8: Commit**

```bash
git add src/globals/FeatureStrip.ts src/globals/HowItWorksSection.ts src/payload.config.ts src/payload-types.ts src/migrations/
git commit -m "Add FeatureStrip and HowItWorksSection Payload globals with migration"
```

---

## Task 2: Shared `HomeIcon` component

**Files:**
- Create: `src/components/storefront/HomeIcons.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `HomeIconName` type (`'truck' | 'vase' | 'pause' | 'flower' | 'home' | 'sparkle'`)
  and `HomeIcon({ name, className }: { name: HomeIconName | string; className?: string })`
  — a React component rendering one `<svg>` with `stroke="currentColor"`.
  Consumed by Task 3 (`FeatureStrip.tsx`) and Task 4 (`HowItWorks.tsx`).

- [ ] **Step 1: Create the component**

```tsx
export type HomeIconName = 'truck' | 'vase' | 'pause' | 'flower' | 'home' | 'sparkle'

const iconPaths: Record<HomeIconName, React.ReactNode> = {
  truck: (
    <>
      <rect x="1" y="7" width="13" height="9" rx="1" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </>
  ),
  vase: (
    <>
      <path d="M9 3h6l-1 4h-4z" />
      <path d="M8 7h8l-1.5 6a4 4 0 0 1-1 2c-.5.6-.5 1.4 0 2l1 1c.6.6.6 1.6 0 2.2-.5.5-1.2.8-2 .8H9.5c-.8 0-1.5-.3-2-.8-.6-.6-.6-1.6 0-2.2l1-1c.5-.6.5-1.4 0-2a4 4 0 0 1-1-2z" />
    </>
  ),
  pause: (
    <>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
    </>
  ),
}

export function HomeIcon({ name, className }: { name: HomeIconName | string; className?: string }) {
  const path = iconPaths[name as HomeIconName] ?? iconPaths.flower

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {path}
    </svg>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/storefront/HomeIcons.tsx
git commit -m "Add shared HomeIcon component for new-theme sections"
```

---

## Task 3: `FeatureStrip` component

**Files:**
- Create: `src/components/storefront/FeatureStrip.tsx`

**Interfaces:**
- Consumes: `HomeIcon` and `HomeIconName` from `./HomeIcons` (Task 2).
- Produces: `FeatureStrip({ items }: { items: FeatureStripItemData[] })` where
  `FeatureStripItemData = { icon: HomeIconName; title: string; subtitle?: string | null }`.
  Consumed by Task 8 (`page.tsx`).

- [ ] **Step 1: Create the component**

```tsx
import { HomeIcon, type HomeIconName } from './HomeIcons'

export type FeatureStripItemData = {
  icon: HomeIconName
  title: string
  subtitle?: string | null
}

export function FeatureStrip({ items }: { items: FeatureStripItemData[] }) {
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col divide-y divide-ink/10 rounded-2xl bg-blush/40 sm:flex-row sm:divide-x sm:divide-y-0">
        {items.map((item, i) => (
          <div key={i} className="flex flex-1 items-center justify-center gap-3 px-6 py-5 text-center sm:text-left">
            <HomeIcon name={item.icon} className="h-8 w-8 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              {item.subtitle && <p className="text-xs text-ink-soft">{item.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/storefront/FeatureStrip.tsx
git commit -m "Add FeatureStrip component"
```

---

## Task 4: `HowItWorks` component

**Files:**
- Create: `src/components/storefront/HowItWorks.tsx`

**Interfaces:**
- Consumes: `HomeIcon` and `HomeIconName` from `./HomeIcons` (Task 2).
- Produces: `HowItWorks({ heading, steps }: { heading: string; steps: HowItWorksStepData[] })`
  where `HowItWorksStepData = { icon: HomeIconName; title: string; subtitle?: string | null }`.
  Consumed by Task 8 (`page.tsx`).

- [ ] **Step 1: Create the component**

```tsx
import { HomeIcon, type HomeIconName } from './HomeIcons'

export type HowItWorksStepData = {
  icon: HomeIconName
  title: string
  subtitle?: string | null
}

export function HowItWorks({ heading, steps }: { heading: string; steps: HowItWorksStepData[] }) {
  if (steps.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-10 text-center text-2xl font-semibold tracking-wide text-ink uppercase">{heading}</h2>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush text-accent">
              <HomeIcon name={step.icon} className="h-8 w-8" />
            </span>
            <span className="text-xs font-semibold tracking-widest text-ink-soft">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-base font-semibold text-ink">{step.title}</p>
            {step.subtitle && <p className="text-sm text-ink-soft">{step.subtitle}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/storefront/HowItWorks.tsx
git commit -m "Add HowItWorks component"
```

---

## Task 5: `Hero` two-column new-theme layout

**Files:**
- Modify: `src/components/storefront/Hero.tsx`

**Interfaces:**
- Consumes: `BrandFlowerAccent` from `./BrandFlowerAccent` (existing,
  unchanged import).
- Produces: `Hero` now takes an additional required prop
  `theme: 'old' | 'new'`. All other props (`heading`, `subheading`,
  `videoUrl`, `fallbackImageUrl`, `fallbackImageAlt`, `ctaButtons`)
  keep their existing names/types. Consumed by Task 8 (`page.tsx`,
  which must pass the new `theme` prop).

- [ ] **Step 1: Read the current file**

Current `src/components/storefront/Hero.tsx` (reproduced here so this
task doesn't depend on reading a neighboring task's output — this is
the file's current, already-on-branch content):

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { BrandFlowerAccent } from './BrandFlowerAccent'

type CtaButton = {
  label: string
  href: string
  style?: 'primary' | 'secondary' | null
}

type HeroProps = {
  heading: string
  subheading?: string | null
  videoUrl?: string | null
  fallbackImageUrl?: string | null
  fallbackImageAlt: string
  ctaButtons: CtaButton[]
}

export function Hero({ heading, subheading, videoUrl, fallbackImageUrl, fallbackImageAlt, ctaButtons }: HeroProps) {
  return (
    <section className="relative flex h-[60vh] max-h-[560px] min-h-[380px] w-full items-center justify-center overflow-hidden bg-blush">
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={fallbackImageUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        fallbackImageUrl && (
          <Image src={fallbackImageUrl} alt={fallbackImageAlt} fill priority sizes="100vw" className="object-cover" />
        )
      )}
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <div className="relative z-10 mx-4 flex max-w-xl flex-col items-center gap-6 rounded-2xl bg-ink/20 px-8 py-10 text-center text-cream backdrop-blur-md">
        <h1
          className="text-3xl tracking-wide uppercase sm:text-4xl"
          style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
        >
          {heading}
        </h1>
        {subheading && (
          <p
            className="text-sm tracking-wide text-cream/90"
            style={{ fontWeight: 'var(--font-weight-brand-light)' }}
          >
            [{subheading}]
          </p>
        )}
        {ctaButtons.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ctaButtons.map((cta) => (
              <Link
                key={cta.href + cta.label}
                href={cta.href}
                className={
                  cta.style === 'secondary'
                    ? 'rounded-full border border-cream/70 px-6 py-3 text-sm font-medium text-cream transition hover:bg-cream/10'
                    : 'rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80'
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      <BrandFlowerAccent className="pointer-events-none absolute right-6 top-6 z-10 hidden h-16 w-16 text-cream/70 [html[data-theme='new']_&]:block sm:h-20 sm:w-20" />
    </section>
  )
}
```

- [ ] **Step 2: Replace the whole file**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { BrandFlowerAccent } from './BrandFlowerAccent'

type CtaButton = {
  label: string
  href: string
  style?: 'primary' | 'secondary' | null
}

type HeroProps = {
  theme: 'old' | 'new'
  heading: string
  subheading?: string | null
  videoUrl?: string | null
  fallbackImageUrl?: string | null
  fallbackImageAlt: string
  ctaButtons: CtaButton[]
}

function CtaButtons({ ctaButtons, theme }: { ctaButtons: CtaButton[]; theme: 'old' | 'new' }) {
  if (ctaButtons.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-4">
      {ctaButtons.map((cta) => (
        <Link
          key={cta.href + cta.label}
          href={cta.href}
          className={
            theme === 'new'
              ? cta.style === 'secondary'
                ? 'rounded-full border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink/5'
                : 'rounded-full bg-accent px-6 py-3 text-sm font-medium text-cream transition hover:bg-accent/90'
              : cta.style === 'secondary'
                ? 'rounded-full border border-cream/70 px-6 py-3 text-sm font-medium text-cream transition hover:bg-cream/10'
                : 'rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80'
          }
        >
          {cta.label}
        </Link>
      ))}
    </div>
  )
}

export function Hero({
  theme,
  heading,
  subheading,
  videoUrl,
  fallbackImageUrl,
  fallbackImageAlt,
  ctaButtons,
}: HeroProps) {
  if (theme === 'new') {
    return (
      <section className="w-full bg-cream">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col gap-6">
            <h1
              className="text-3xl tracking-wide text-ink sm:text-4xl lg:text-5xl"
              style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
            >
              {heading}
            </h1>
            {subheading && (
              <p className="text-base text-ink-soft" style={{ fontWeight: 'var(--font-weight-brand-light)' }}>
                {subheading}
              </p>
            )}
            <CtaButtons ctaButtons={ctaButtons} theme={theme} />
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-blush">
            {fallbackImageUrl && (
              <Image
                src={fallbackImageUrl}
                alt={fallbackImageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative flex h-[60vh] max-h-[560px] min-h-[380px] w-full items-center justify-center overflow-hidden bg-blush">
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={fallbackImageUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        fallbackImageUrl && (
          <Image src={fallbackImageUrl} alt={fallbackImageAlt} fill priority sizes="100vw" className="object-cover" />
        )
      )}
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <div className="relative z-10 mx-4 flex max-w-xl flex-col items-center gap-6 rounded-2xl bg-ink/20 px-8 py-10 text-center text-cream backdrop-blur-md">
        <h1
          className="text-3xl tracking-wide uppercase sm:text-4xl"
          style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
        >
          {heading}
        </h1>
        {subheading && (
          <p
            className="text-sm tracking-wide text-cream/90"
            style={{ fontWeight: 'var(--font-weight-brand-light)' }}
          >
            [{subheading}]
          </p>
        )}
        <CtaButtons ctaButtons={ctaButtons} theme={theme} />
      </div>
      <BrandFlowerAccent className="pointer-events-none absolute right-6 top-6 z-10 hidden h-16 w-16 text-cream/70 [html[data-theme='new']_&]:block sm:h-20 sm:w-20" />
    </section>
  )
}
```

Note the old branch's `CtaButtons` call replaces the inline `.map`
block that was there before, but produces byte-identical class strings
for `theme === 'old'` (verify this when you self-review — the
`theme === 'new' ? ... : ...` ternary inside `CtaButtons`'s `className`
must fall through to exactly the old classes when `theme` is `'old'`).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors at every call site of `<Hero .../>` that doesn't pass
`theme` yet — expected at this point, since Task 8 hasn't updated
`page.tsx`. Confirm the only errors are about the missing `theme` prop
on `Hero`, nothing else.

- [ ] **Step 4: Commit**

```bash
git add src/components/storefront/Hero.tsx
git commit -m "Add theme prop and two-column new-theme layout to Hero"
```

---

## Task 6: `FormatsGrid` new-theme card style

**Files:**
- Modify: `src/components/storefront/FormatsGrid.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `FormatsGrid` now takes an additional required prop
  `theme: 'old' | 'new'`. `FormatCardData` and the `cards` prop are
  unchanged. Consumed by Task 8 (`page.tsx`).

- [ ] **Step 1: Replace the whole file**

Current `src/components/storefront/FormatsGrid.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'

export type FormatCardData = {
  title: string
  subtitle: string
  buttonLabel: string
  buttonHref: string
  imageUrl?: string | null
}

export function FormatsGrid({ cards }: { cards: FormatCardData[] }) {
  if (cards.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-blush shadow-sm transition hover:shadow-md"
          >
            {card.imageUrl && (
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <div className="relative z-10 flex flex-col gap-3 p-5 text-cream">
              <h3 className="text-base font-semibold tracking-wide uppercase">{card.title}</h3>
              <p className="text-sm text-cream/90">{card.subtitle}</p>
              <Link
                href={card.buttonHref}
                className="mt-1 inline-flex w-fit items-center rounded-full bg-cream px-5 py-2 text-sm font-medium text-ink transition hover:bg-cream/90"
              >
                {card.buttonLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

Replace it with:

```tsx
import Image from 'next/image'
import Link from 'next/link'

export type FormatCardData = {
  title: string
  subtitle: string
  buttonLabel: string
  buttonHref: string
  imageUrl?: string | null
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  )
}

export function FormatsGrid({ cards, theme }: { cards: FormatCardData[]; theme: 'old' | 'new' }) {
  if (cards.length === 0) return null

  if (theme === 'new') {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-blush">
                {card.imageUrl && (
                  <Image
                    src={card.imageUrl}
                    alt={card.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="relative flex flex-1 flex-col gap-1 p-5">
                <h3 className="text-base font-semibold text-ink">{card.title}</h3>
                <p className="pr-10 text-sm text-ink-soft">{card.subtitle}</p>
                <Link
                  href={card.buttonHref}
                  aria-label={card.buttonLabel}
                  className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-cream transition group-hover:bg-accent/90"
                >
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-blush shadow-sm transition hover:shadow-md"
          >
            {card.imageUrl && (
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <div className="relative z-10 flex flex-col gap-3 p-5 text-cream">
              <h3 className="text-base font-semibold tracking-wide uppercase">{card.title}</h3>
              <p className="text-sm text-cream/90">{card.subtitle}</p>
              <Link
                href={card.buttonHref}
                className="mt-1 inline-flex w-fit items-center rounded-full bg-cream px-5 py-2 text-sm font-medium text-ink transition hover:bg-cream/90"
              >
                {card.buttonLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors only at `FormatsGrid`'s call site in `page.tsx` for
the missing `theme` prop (fixed in Task 8) — no other errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/storefront/FormatsGrid.tsx
git commit -m "Add theme prop and new-theme card style to FormatsGrid"
```

---

## Task 7: `Header` new-theme icon row

**Files:**
- Modify: `src/components/storefront/Header.tsx`

**Interfaces:**
- Consumes: `Logo` from `./Logo` (existing, unchanged), `CartDrawer`
  from `./CartDrawer` (existing, unchanged).
- Produces: `Header` now takes an additional required prop
  `theme: 'old' | 'new'`. `logoUrl` and `crossSellProducts` props are
  unchanged. Consumed by Task 8 (`layout.tsx`).

- [ ] **Step 1: Replace the whole file**

Current `src/components/storefront/Header.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'

import { CartDrawer, type CrossSellProduct } from './CartDrawer'
import { Logo } from './Logo'

export function Header({ logoUrl, crossSellProducts }: { logoUrl?: string | null; crossSellProducts?: CrossSellProduct[] }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-cream/90 px-6 py-3 text-ink backdrop-blur sm:px-10">
      <Link href="/" className="flex items-center">
        {logoUrl ? (
          <Image src={logoUrl} alt="kvitkova povnya" width={1628} height={485} className="h-14 w-auto sm:h-16" priority />
        ) : (
          <Logo />
        )}
      </Link>
      <nav className="hidden gap-6 text-sm sm:flex">
        <Link href="/katalog/pidpyska" className="hover:text-accent">
          Підписка для дому
        </Link>
        <Link href="/business" className="hover:text-accent">
          Для бізнесу
        </Link>
        <Link href="/wedding" className="hover:text-accent">
          Весілля
        </Link>
        <Link href="/gift-certificates" className="hover:text-accent">
          Подарункові сертифікати
        </Link>
      </nav>
      <CartDrawer crossSellProducts={crossSellProducts} />
    </header>
  )
}
```

Replace it with:

```tsx
import Link from 'next/link'
import Image from 'next/image'

import { CartDrawer, type CrossSellProduct } from './CartDrawer'
import { Logo } from './Logo'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />
    </svg>
  )
}

function HeaderIconPlaceholders() {
  return (
    <div className="hidden items-center gap-4 text-ink [html[data-theme='new']_&]:flex">
      <span role="img" aria-label="Пошук" className="cursor-default">
        <SearchIcon />
      </span>
      <span role="img" aria-label="Акаунт" className="cursor-default">
        <UserIcon />
      </span>
      <span role="img" aria-label="Список бажань" className="cursor-default">
        <HeartIcon />
      </span>
    </div>
  )
}

export function Header({
  theme,
  logoUrl,
  crossSellProducts,
}: {
  theme: 'old' | 'new'
  logoUrl?: string | null
  crossSellProducts?: CrossSellProduct[]
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-cream/90 px-6 py-3 text-ink backdrop-blur sm:px-10">
      <Link href="/" className="flex items-center">
        {logoUrl ? (
          <Image src={logoUrl} alt="kvitkova povnya" width={1628} height={485} className="h-14 w-auto sm:h-16" priority />
        ) : (
          <Logo />
        )}
      </Link>
      <nav className="hidden gap-6 text-sm sm:flex">
        <Link href="/katalog/pidpyska" className="hover:text-accent">
          Підписка для дому
        </Link>
        <Link href="/business" className="hover:text-accent">
          Для бізнесу
        </Link>
        <Link href="/wedding" className="hover:text-accent">
          Весілля
        </Link>
        <Link href="/gift-certificates" className="hover:text-accent">
          Подарункові сертифікати
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        {theme === 'new' && <HeaderIconPlaceholders />}
        <CartDrawer crossSellProducts={crossSellProducts} />
      </div>
    </header>
  )
}
```

Note: `HeaderIconPlaceholders` is only rendered when `theme === 'new'`
(the `{theme === 'new' && ...}` guard in `Header`'s JSX), so its own
internal `[html[data-theme='new']_&]:flex` class is redundant but
harmless — it's written this way so the component behaves correctly
even if reused elsewhere later. Do not remove the `theme === 'new' &&`
guard in `Header`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors only at `Header`'s call site in `layout.tsx` for the
missing `theme` prop (fixed in Task 8) — no other errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/storefront/Header.tsx
git commit -m "Add theme prop and new-theme icon row to Header"
```

---

## Task 8: Wire `theme` and new sections through `layout.tsx` and `page.tsx`

**Files:**
- Modify: `src/app/(storefront)/layout.tsx`
- Modify: `src/app/(storefront)/page.tsx`

**Interfaces:**
- Consumes: `Header` (now requires `theme`, Task 7), `Hero` (now
  requires `theme`, Task 5), `FormatsGrid` (now requires `theme`,
  Task 6), `FeatureStrip` (Task 3), `HowItWorks` (Task 4), and the two
  new Payload globals `feature-strip` / `how-it-works-section`
  (Task 1).
- Produces: nothing new for other tasks — this is the final wiring
  task before QA (Task 9).

- [ ] **Step 1: Update `layout.tsx` to pass `theme` to `Header`**

Current `src/app/(storefront)/layout.tsx:41-48`:

```tsx
    <html
      lang="uk"
      data-theme={siteSettings.designTheme || 'old'}
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header logoUrl={mediaUrl(siteSettings.logo, 'card')} crossSellProducts={crossSellProducts} />
```

Replace with:

```tsx
    <html
      lang="uk"
      data-theme={siteSettings.designTheme || 'old'}
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header
            theme={siteSettings.designTheme || 'old'}
            logoUrl={mediaUrl(siteSettings.logo, 'card')}
            crossSellProducts={crossSellProducts}
          />
```

(Everything below this in the file — `<main>`, `<Footer>`, closing
tags — is unchanged.)

- [ ] **Step 2: Fetch the two new globals in `page.tsx`**

Current `src/app/(storefront)/page.tsx:14-31`:

```tsx
export default async function HomePage() {
  const payload = await getPayloadClient()

  const [hero, siteSettings, subscriptionInfo, weddingPage, formatsSection, featuredProducts, instagramPosts] =
    await Promise.all([
      payload.findGlobal({ slug: 'hero' }),
      payload.findGlobal({ slug: 'site-settings' }),
      payload.findGlobal({ slug: 'subscription-info' }),
      payload.findGlobal({ slug: 'wedding-page' }),
      payload.findGlobal({ slug: 'formats-section' }),
      payload.find({
        collection: 'products',
        where: { and: [{ _status: { equals: 'published' } }, { featured: { equals: true } }] },
        sort: 'sortOrder',
        limit: 8,
      }),
      getInstagramFeed(),
    ])
```

Replace with:

```tsx
export default async function HomePage() {
  const payload = await getPayloadClient()

  const [
    hero,
    siteSettings,
    subscriptionInfo,
    weddingPage,
    formatsSection,
    featureStrip,
    howItWorksSection,
    featuredProducts,
    instagramPosts,
  ] = await Promise.all([
    payload.findGlobal({ slug: 'hero' }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'subscription-info' }),
    payload.findGlobal({ slug: 'wedding-page' }),
    payload.findGlobal({ slug: 'formats-section' }),
    payload.findGlobal({ slug: 'feature-strip' }),
    payload.findGlobal({ slug: 'how-it-works-section' }),
    payload.find({
      collection: 'products',
      where: { and: [{ _status: { equals: 'published' } }, { featured: { equals: true } }] },
      sort: 'sortOrder',
      limit: 8,
    }),
    getInstagramFeed(),
  ])

  const theme = siteSettings.designTheme || 'old'
```

- [ ] **Step 3: Import the new components**

Add near the top of `page.tsx`, alongside the other component imports:

```tsx
import { FeatureStrip } from '@/components/storefront/FeatureStrip'
import { HowItWorks } from '@/components/storefront/HowItWorks'
```

- [ ] **Step 4: Pass `theme` to `Hero` and `FormatsGrid`, and insert the two new sections**

Current `src/app/(storefront)/page.tsx:33-60` (the returned JSX, from
`<Hero` through the end of `<FormatsGrid .../>`):

```tsx
  return (
    <>
      <Hero
        heading={hero.heading}
        subheading={hero.subheading}
        videoUrl={mediaUrl(hero.video)}
        fallbackImageUrl={mediaUrl(hero.fallbackImage)}
        fallbackImageAlt={hero.heading}
        ctaButtons={(hero.ctaButtons || []).map((cta) => ({
          label: cta.label,
          href: cta.href,
          style: cta.style,
        }))}
      />

      {subscriptionInfo.tickerText && <TickerStrip text={subscriptionInfo.tickerText} />}

      <FormatsGrid
        cards={[...(formatsSection.cards || [])]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((card) => ({
            title: card.title,
            subtitle: card.subtitle,
            buttonLabel: card.buttonLabel,
            buttonHref: card.buttonHref,
            imageUrl: mediaUrl(card.image, 'card'),
          }))}
      />
```

Replace with:

```tsx
  return (
    <>
      <Hero
        theme={theme}
        heading={hero.heading}
        subheading={hero.subheading}
        videoUrl={mediaUrl(hero.video)}
        fallbackImageUrl={mediaUrl(hero.fallbackImage)}
        fallbackImageAlt={hero.heading}
        ctaButtons={(hero.ctaButtons || []).map((cta) => ({
          label: cta.label,
          href: cta.href,
          style: cta.style,
        }))}
      />

      {theme === 'new' && (
        <FeatureStrip
          items={(featureStrip.items || []).map((item) => ({
            icon: item.icon,
            title: item.title,
            subtitle: item.subtitle,
          }))}
        />
      )}

      {subscriptionInfo.tickerText && <TickerStrip text={subscriptionInfo.tickerText} />}

      <FormatsGrid
        theme={theme}
        cards={[...(formatsSection.cards || [])]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((card) => ({
            title: card.title,
            subtitle: card.subtitle,
            buttonLabel: card.buttonLabel,
            buttonHref: card.buttonHref,
            imageUrl: mediaUrl(card.image, 'card'),
          }))}
      />

      {theme === 'new' && (
        <HowItWorks
          heading={howItWorksSection.heading}
          steps={(howItWorksSection.steps || []).map((step) => ({
            icon: step.icon,
            title: step.title,
            subtitle: step.subtitle,
          }))}
        />
      )}
```

Everything from `<SubscriptionExplainer` onward in the file is
unchanged — do not modify it.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (this task resolves the "missing `theme` prop"
errors left open by Tasks 5-7).

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(storefront\)/layout.tsx src/app/\(storefront\)/page.tsx
git commit -m "Wire theme prop and new homepage sections into layout and page"
```

---

## Task 9: Full manual QA across both themes

**Files:** none (verification-only task).

**Interfaces:** N/A.

- [ ] **Step 1: Start the app against a real Payload admin**

Run: `npm run dev`. Log into `/admin`. Confirm two new entries appear
under "Контент сайту" in the sidebar: "Стрічка переваг" and 'Блок "Як
це працює"', each pre-populated with the default items/steps from
Task 1's `defaultValue`.

- [ ] **Step 2: Verify old theme is unchanged (regression check)**

With `site-settings`'s "Дизайн сайту" set to "Старий дизайн" (the
default), load `/`. Confirm: Hero still centers text over a full-bleed
photo/video with no visible layout shift from before this plan; no
feature-strip row and no "Як це працює" section appear anywhere on the
page; `FormatsGrid` cards still show the full-bleed photo with dark
gradient and pill button; header still shows no search/account/wishlist
icons.

- [ ] **Step 3: Verify new theme**

Switch "Дизайн сайту" to "Новий дизайн (ребрендінг)" in the admin,
save, reload `/`. Confirm: Hero is two columns (text left, rounded
photo right, no video even if one is set), with up to two CTA buttons
styled per `cta.style`; a feature-strip row with 3 items (icon + title)
appears directly under the Hero; `FormatsGrid` cards show photo-on-top
white cards with an arrow-in-circle link in the bottom-right corner;
a "Як це працює" section with 3 numbered steps appears after
`FormatsGrid`; header shows three static icons (search/user/heart)
before the cart icon.

- [ ] **Step 4: Verify content editing round-trips**

In the admin, edit one item's title in "Стрічка переваг" and one
step's title in 'Блок "Як це працює"', save, and confirm the change
appears on `/` without needing a hard refresh past the save (the
`revalidatePath('/', 'layout')` hook should make this immediate).

- [ ] **Step 5: Run project-wide checks**

Run: `npx tsc --noEmit` and `npm run lint`.
Expected: both pass with no errors introduced by this plan.

- [ ] **Step 6: Commit (if Step 5 required fixes) or skip**

If Step 5 required any fixes, commit them now with message "Fix
lint/type issues from new-theme homepage QA". If nothing needed
fixing, no commit is needed for this task.
