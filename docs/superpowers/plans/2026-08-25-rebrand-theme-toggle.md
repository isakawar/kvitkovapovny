# Rebrand Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global "old design / new (rebrand) design" switch to the
Payload admin that swaps the storefront's colors, brand-weight
typography, and logo/decorative flower graphics site-wide.

**Architecture:** One new `select` field (`designTheme`) on the
`site-settings` Payload global. The storefront root layout reads it and
sets `data-theme="old"|"new"` on `<html>`. A parallel block of CSS
custom-property overrides in `globals.css`, scoped to
`[data-theme='new']`, repaints every component that already consumes
`--color-*` tokens with no code changes to those components. Three
components (`Logo`, `Hero`, `ProductCard`) get additional theme-specific
markup (new logo lockup, line-art flower accents) toggled with the same
attribute selector, so no client-side JS or React context is needed.

**Tech Stack:** Next.js 16 (App Router, React Server Components),
Payload CMS 3 (Postgres), Tailwind CSS v4 (CSS-custom-property based
`@theme inline`), TypeScript, no test framework in this repo (verify via
`npx tsc --noEmit`, `npm run lint`, and manual browser QA on the dev
server).

**Spec:** `docs/superpowers/specs/2026-08-25-rebrand-theme-toggle-design.md`

## Global Constraints

- Default value of `designTheme` is `'old'` — no visitor sees any change
  until an admin flips the switch.
- New palette: `--color-cream: #faf8e9`, `--color-blush: #f3f1ea`,
  `--color-sage: #c9d170`, `--color-ink: #2b2b28`,
  `--color-ink-soft: #6d6a60`, `--color-accent: #9eaf00`,
  `--color-accent-warm: #e8871e` (new token, both themes must define
  it).
- No new npm dependencies, no new webfont — brand weight contrast is
  done with existing Montserrat variable font (weights 300 / 900).
- No React Context / client component needed for theming — everything
  is CSS-attribute-selector driven from the server-rendered
  `data-theme` attribute on `<html>`.
- Existing `revalidatePath('/')` in `site-settings`'s `afterChange` hook
  already covers cache invalidation for the new field — do not add
  another hook.

---

## File Structure

- Modify: `src/globals/SiteSettings.ts` — add `designTheme` select field.
- Modify: `src/app/(storefront)/layout.tsx` — set `data-theme` attribute
  on `<html>` from `siteSettings.designTheme`.
- Modify: `src/app/(storefront)/globals.css` — add
  `:root[data-theme='new']` token overrides, `--color-accent-warm` in
  both themes, and brand font-weight variables.
- Modify: `src/components/storefront/Logo.tsx` — add new-theme logo
  markup (olive badge), CSS-toggled against the old moon-mark markup.
- Modify: `src/components/storefront/Hero.tsx` — add new-theme
  line-art flower SVG accent + brand font-weight classes.
- Modify: `src/components/storefront/ProductCard.tsx` — add new-theme
  corner flower SVG accent.
- Create: `src/components/storefront/BrandFlowerAccent.tsx` — shared
  inline SVG line-art flower icon used by `Hero` and `ProductCard` (DRY
  — avoids duplicating the same SVG path twice).

No other files change. All other storefront components already consume
the `--color-*` Tailwind tokens (`bg-cream`, `text-ink`, `text-accent`,
`bg-blush`, etc.) and repaint automatically once the tokens are
overridden — confirmed by grep of `src/components/storefront` and
`src/app/(storefront)`.

---

## Task 1: Add `designTheme` field to Site Settings global

**Files:**
- Modify: `src/globals/SiteSettings.ts:16-33` (top of the `fields` array)

**Interfaces:**
- Consumes: nothing new.
- Produces: `siteSettings.designTheme: 'old' | 'new'` — read by Task 2
  (`layout.tsx`).

- [ ] **Step 1: Add the field**

Edit `src/globals/SiteSettings.ts`. Insert this as the first entry in
the `fields` array (right after the opening `fields: [`, before the
existing `logo` field):

```ts
    {
      name: 'designTheme',
      type: 'select',
      label: 'Дизайн сайту',
      defaultValue: 'old',
      options: [
        { label: 'Старий дизайн', value: 'old' },
        { label: 'Новий дизайн (ребрендінг)', value: 'new' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Перемикає весь сайт між старою та новою фірмовою темою',
      },
    },
```

- [ ] **Step 2: Regenerate Payload types**

Run: `node --env-file=.env --import tsx scripts/generate-types.mjs`

This updates the generated `payload-types.ts` (or equivalent) so
`siteSettings.designTheme` is typed. If the command errors because it
needs a live DB connection, note the error and continue — the field
still works at runtime via Payload's schema introspection; re-run this
step once a DB is reachable, before Task 2 relies on the type.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors related to `SiteSettings.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/globals/SiteSettings.ts
git commit -m "Add designTheme toggle field to site settings"
```

---

## Task 2: Set `data-theme` attribute on `<html>`

**Files:**
- Modify: `src/app/(storefront)/layout.tsx:41`

**Interfaces:**
- Consumes: `siteSettings.designTheme` (Task 1). `siteSettings` is
  already fetched at `layout.tsx:24` via
  `payload.findGlobal({ slug: 'site-settings' })`.
- Produces: `<html data-theme="old"|"new">` — consumed by every CSS rule
  added in Task 3, and by the component markup in Tasks 4-6.

- [ ] **Step 1: Read current line**

`src/app/(storefront)/layout.tsx:41` currently reads:

```tsx
    <html lang="uk" className={`${montserrat.variable} h-full antialiased`}>
```

- [ ] **Step 2: Add the attribute**

Replace that line with:

```tsx
    <html
      lang="uk"
      data-theme={siteSettings.designTheme || 'old'}
      className={`${montserrat.variable} h-full antialiased`}
    >
```

(`|| 'old'` guards the case where the field is `null`/unset on an
existing document created before this migration, so the site still
renders the old theme instead of an unstyled/undefined state.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual check (old theme still default)**

Run: `npm run dev`, open `http://localhost:3000`, open browser dev
tools, inspect the `<html>` element — confirm `data-theme="old"` is
present (since no admin has flipped the field yet, Payload returns the
`defaultValue` from Task 1 or `null`, both of which resolve to `'old'`
here). Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(storefront\)/layout.tsx
git commit -m "Expose designTheme as data-theme attribute on html"
```

---

## Task 3: New-theme CSS token overrides

**Files:**
- Modify: `src/app/(storefront)/globals.css:1-20`

**Interfaces:**
- Consumes: `data-theme` attribute (Task 2).
- Produces: `--color-accent-warm` custom property (new — must exist in
  both themes so Task 5/6 SVG accents can reference it without a
  fallback), and the full `--color-*` override set consumed implicitly
  by every component using Tailwind's `bg-cream`/`text-ink`/etc.
  classes. Also produces `--font-weight-brand-bold` /
  `--font-weight-brand-light` custom properties, consumed by Task 5
  (`Hero.tsx`) and Task 4 (`Logo.tsx`).

- [ ] **Step 1: Read current `:root` block**

Current `src/app/(storefront)/globals.css:1-20`:

```css
@import "tailwindcss";

:root {
  --color-cream: #faf6f1;
  --color-blush: #f0e0da;
  --color-sage: #8a9a80;
  --color-ink: #362f28;
  --color-ink-soft: #6b6155;
  --color-accent: #a8785f;
}

@theme inline {
  --color-cream: var(--color-cream);
  --color-blush: var(--color-blush);
  --color-sage: var(--color-sage);
  --color-ink: var(--color-ink);
  --color-ink-soft: var(--color-ink-soft);
  --color-accent: var(--color-accent);
  --font-sans: var(--font-montserrat);
}
```

- [ ] **Step 2: Add `--color-accent-warm` to the old theme and register
  it in `@theme inline`, plus brand font-weight variables**

Replace that whole block with:

```css
@import "tailwindcss";

:root {
  --color-cream: #faf6f1;
  --color-blush: #f0e0da;
  --color-sage: #8a9a80;
  --color-ink: #362f28;
  --color-ink-soft: #6b6155;
  --color-accent: #a8785f;
  --color-accent-warm: #a8785f;
  --font-weight-brand-bold: 700;
  --font-weight-brand-light: 400;
}

:root[data-theme='new'] {
  --color-cream: #faf8e9;
  --color-blush: #f3f1ea;
  --color-sage: #c9d170;
  --color-ink: #2b2b28;
  --color-ink-soft: #6d6a60;
  --color-accent: #9eaf00;
  --color-accent-warm: #e8871e;
  --font-weight-brand-bold: 900;
  --font-weight-brand-light: 300;
}

@theme inline {
  --color-cream: var(--color-cream);
  --color-blush: var(--color-blush);
  --color-sage: var(--color-sage);
  --color-ink: var(--color-ink);
  --color-ink-soft: var(--color-ink-soft);
  --color-accent: var(--color-accent);
  --color-accent-warm: var(--color-accent-warm);
  --font-sans: var(--font-montserrat);
}
```

(Old theme's `--color-accent-warm` and brand font weights are set equal
to its existing accent/weights so any component that later references
them looks identical to today under the old theme — no visual change
for `data-theme="old"`.)

- [ ] **Step 3: Typecheck / lint**

Run: `npm run lint`
Expected: no new errors (CSS isn't linted by ESLint, but this confirms
nothing else broke).

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`. In the browser console, run
`document.documentElement.setAttribute('data-theme', 'new')` on the
homepage and confirm the background, header, buttons, and price text
all repaint to the olive-green palette instantly (no page reload
needed, proving the CSS cascade works). Set it back to `'old'` and
confirm it reverts. Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(storefront\)/globals.css
git commit -m "Add new-theme CSS token overrides for rebrand"
```

---

## Task 4: Shared line-art flower SVG accent component

**Files:**
- Create: `src/components/storefront/BrandFlowerAccent.tsx`

**Interfaces:**
- Consumes: nothing (pure presentational component).
- Produces: `BrandFlowerAccent({ className }: { className?: string })`
  — a React component rendering a single-color outline flower SVG
  (`stroke="currentColor"`, `fill="none"`), sized by the caller via
  `className`. Consumed by Task 5 (`Hero.tsx`) and Task 6
  (`ProductCard.tsx`).

- [ ] **Step 1: Create the component**

```tsx
export function BrandFlowerAccent({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="32" cy="32" r="7" />
      <circle cx="32" cy="16" r="9" />
      <circle cx="32" cy="48" r="9" />
      <circle cx="16" cy="32" r="9" />
      <circle cx="48" cy="32" r="9" />
      <path d="M32 39v14" strokeLinecap="round" />
      <path d="M28 50c-3 2-4 5-4 8" strokeLinecap="round" />
    </svg>
  )
}
```

This mirrors the brand book's simple five-petal contour flower (page
"ФІРМОВІ ЕЛЕМЕНТИ") — five overlapping outline circles around a
center, plus a short stem, all in one `currentColor` stroke so callers
can tint it via `text-*` color utility classes.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/storefront/BrandFlowerAccent.tsx
git commit -m "Add shared line-art flower accent component"
```

---

## Task 5: New-theme logo lockup in `Logo`

**Files:**
- Modify: `src/components/storefront/Logo.tsx`

**Interfaces:**
- Consumes: `--color-accent`, `--color-cream`, `--font-weight-brand-bold`,
  `--font-weight-brand-light` custom properties (Task 3); `data-theme`
  attribute (Task 2, via CSS selector, not a prop).
- Produces: `Logo({ className }: { className?: string })` — same
  exported signature as before, so `Header.tsx:14` (`<Logo />`) needs no
  changes.

- [ ] **Step 1: Read current file**

Current `src/components/storefront/Logo.tsx` renders `MoonMark` plus
"KVITKOVA" / "POVNYA" text, unconditionally.

- [ ] **Step 2: Wrap the existing (old) markup and add the new-theme
  markup, toggled by `data-theme` via Tailwind's arbitrary variant**

Replace the `Logo` export (keep `MoonMark` as-is above it) with:

```tsx
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`relative flex items-center ${className ?? ''}`}>
      <span className="flex items-center gap-3 text-ink [html[data-theme='new']_&]:hidden">
        <MoonMark className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" />
        <span className="h-8 w-px bg-ink/30 sm:h-9" />
        <span className="flex flex-col leading-none">
          <span className="text-lg font-semibold tracking-[0.18em] sm:text-xl">KVITKOVA</span>
          <span className="mt-1 text-[10px] tracking-[0.5em] text-ink-soft sm:text-xs">POVNYA</span>
        </span>
      </span>
      <span className="hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-cream [html[data-theme='new']_&]:flex">
        <span
          className="text-sm tracking-[0.05em] sm:text-base"
          style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
        >
          KVITKOVA.
        </span>
        <span
          className="text-sm tracking-[0.05em] sm:text-base"
          style={{ fontWeight: 'var(--font-weight-brand-light)' }}
        >
          POVNYA
        </span>
      </span>
    </span>
  )
}
```

Both branches render in the DOM at all times; only one is visible per
theme via the `[html[data-theme='new']_&]:hidden` /
`[html[data-theme='new']_&]:flex` arbitrary variants (Tailwind v4
supports arbitrary selector variants of this form). This avoids any
hydration mismatch since the server already knows `data-theme` when it
renders `<html>` in Task 2.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`. On the homepage, toggle
`document.documentElement.setAttribute('data-theme', 'new')` in the
browser console (or flip the Payload admin field once Task 1's admin UI
is live — either works). Confirm the header logo switches from the old
moon-mark lockup to the olive rounded-pill "KVITKOVA. POVNYA" lockup,
and back when toggled to `'old'`. Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add src/components/storefront/Logo.tsx
git commit -m "Add new-theme logo lockup to Logo component"
```

---

## Task 6: New-theme decorative accent in `Hero`

**Files:**
- Modify: `src/components/storefront/Hero.tsx`

**Interfaces:**
- Consumes: `BrandFlowerAccent` (Task 4); `--font-weight-brand-bold` /
  `--font-weight-brand-light` custom properties (Task 3); `data-theme`
  attribute (Task 2, via CSS selector).
- Produces: same `Hero` props signature as before — `page.tsx:35-46`
  needs no changes.

- [ ] **Step 1: Add the import**

At the top of `src/components/storefront/Hero.tsx`, add:

```tsx
import { BrandFlowerAccent } from './BrandFlowerAccent'
```

- [ ] **Step 2: Add the decorative accent and brand-weight heading**

Current heading/subheading block (`Hero.tsx:39-40`):

```tsx
        <h1 className="text-3xl font-semibold tracking-wide uppercase sm:text-4xl">{heading}</h1>
        {subheading && <p className="text-sm tracking-wide text-cream/90">[{subheading}]</p>}
```

Replace with:

```tsx
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
```

Then, immediately after the closing `</div>` of the content card (the
`div` that starts at `Hero.tsx:38` and currently ends right before the
outer `</section>` at line 59), add the decorative accent as a sibling
inside `<section>` but outside the content card, so it sits in the
corner of the banner rather than inside the text card:

```tsx
      <BrandFlowerAccent className="pointer-events-none absolute right-6 top-6 z-10 hidden h-16 w-16 text-cream/70 [html[data-theme='new']_&]:block sm:h-20 sm:w-20" />
```

Place this line right before the final `</section>` closing tag.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`. On the homepage with `data-theme` toggled to
`'new'` (browser console, as in Task 5), confirm a small outline flower
appears in the top-right corner of the hero banner, and the heading
looks bold/heavy while the subheading looks light — and that with
`data-theme="old"` the accent is absent and the heading looks the same
as it does on `main` today. Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add src/components/storefront/Hero.tsx
git commit -m "Add new-theme flower accent and brand-weight heading to Hero"
```

---

## Task 7: New-theme corner accent in `ProductCard`

**Files:**
- Modify: `src/components/storefront/ProductCard.tsx`

**Interfaces:**
- Consumes: `BrandFlowerAccent` (Task 4); `data-theme` attribute
  (Task 2, via CSS selector).
- Produces: same `ProductCard` props signature as before — every caller
  (`ProductGrid.tsx`, `katalog` pages, etc.) needs no changes.

- [ ] **Step 1: Add the import**

At the top of `src/components/storefront/ProductCard.tsx`, add:

```tsx
import { BrandFlowerAccent } from './BrandFlowerAccent'
```

- [ ] **Step 2: Add the corner accent**

Current image wrapper (`ProductCard.tsx:21-37`) is a
`<div className="relative aspect-square overflow-hidden bg-blush">`
containing the `Image` and the out-of-stock overlay. Add the accent as
a sibling right after the out-of-stock `{!product.inStock && (...)}`
block, still inside that same `relative` wrapper div (so it positions
against the image, not the whole card):

```tsx
        <BrandFlowerAccent className="pointer-events-none absolute bottom-2 right-2 z-10 hidden h-6 w-6 text-cream/90 [html[data-theme='new']_&]:block" />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`. Visit `/katalog` with `data-theme` toggled to
`'new'` — confirm a small outline flower sits in the bottom-right
corner of each product image, not overlapping the product name/price
text below the image, and doesn't appear when `data-theme="old"`. Stop
the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add src/components/storefront/ProductCard.tsx
git commit -m "Add new-theme corner flower accent to ProductCard"
```

---

## Task 8: Full manual QA across both themes

**Files:** none (verification-only task).

**Interfaces:** N/A.

- [ ] **Step 1: Start the app against a real Payload admin**

Run: `npm run dev`. Log into `/admin`, open "Налаштування сайту"
(`site-settings`), confirm the new "Дизайн сайту" field appears in the
sidebar with "Старий дизайн" selected by default.

- [ ] **Step 2: Verify old theme end-to-end (baseline, no regressions)**

With "Старий дизайн" selected, visit and visually compare against
`main` (or your memory of current production) each of: `/` (home),
`/katalog`, a product detail page under `/product/[slug]`, `/cart`,
`/checkout`, `/wedding`, `/business`, `/gift-certificates`, `/contacts`.
Everything must look pixel-identical to before this branch — colors,
logo, hero, product cards.

- [ ] **Step 3: Verify new theme end-to-end**

In the admin, switch "Дизайн сайту" to "Новий дизайн (ребрендінг)" and
save. Revisit the same pages from Step 2. Confirm: olive-green accent
color throughout (buttons, price text, links), cream/neutral
backgrounds, new pill-shaped logo lockup in the header, flower accent
in the hero corner, flower accents on product cards, bold/light
heading-weight contrast in the hero.

- [ ] **Step 4: Verify toggle round-trip**

Switch back to "Старий дизайн" in the admin, reload `/`, confirm it
reverts fully (logo, colors, hero accent all back to old).

- [ ] **Step 5: Run project-wide checks**

Run: `npx tsc --noEmit` and `npm run lint`.
Expected: both pass with no errors introduced by this branch.

- [ ] **Step 6: Commit (if Step 5 required fixes) or skip**

If Step 5 required any fixes, commit them now with message
`"Fix lint/type issues from rebrand theme QA"`. If nothing needed
fixing, no commit is needed for this task.
