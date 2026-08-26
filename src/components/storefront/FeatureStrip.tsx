import Link from 'next/link'

import { HomeIcon, type HomeIconName } from './HomeIcons'

export type FeatureStripItemData = {
  icon: HomeIconName
  title: string
  description?: string | null
}

export type FeatureStripProps = {
  heading?: string | null
  items: FeatureStripItemData[]
  cta?: { label?: string | null; href?: string | null } | null
}

export function FeatureStrip({ heading, items, cta }: FeatureStripProps) {
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
      {heading && (
        <h2
          className="text-2xl tracking-wide text-ink sm:text-3xl"
          style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
        >
          {heading}
        </h2>
      )}
      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ink/10">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-3 px-4 sm:px-8">
            <HomeIcon name={item.icon} className="h-10 w-10 shrink-0 text-accent" />
            <p className="text-sm font-semibold tracking-wide text-ink uppercase">{item.title}</p>
            {item.description && <p className="text-sm text-ink-soft">{item.description}</p>}
          </div>
        ))}
      </div>
      {cta?.label && cta?.href && (
        <Link
          href={cta.href}
          className="mt-10 inline-block text-sm font-semibold tracking-wide text-ink uppercase underline underline-offset-4 transition hover:text-accent"
        >
          {cta.label}
        </Link>
      )}
    </section>
  )
}
