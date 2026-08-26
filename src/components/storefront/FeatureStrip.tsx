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
    <section className="bg-[#1E1E1E] px-4 py-16 text-center sm:px-6">
      <div className="mx-auto max-w-6xl">
        {heading && (
          <h2
            className="text-2xl tracking-wide text-[#faf8e9] sm:text-3xl"
            style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
          >
            {heading}
          </h2>
        )}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-4 rounded-2xl border border-[#faf8e9]/10 bg-[#faf8e9]/5 px-6 py-10"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#faf8e9]/10 text-accent-warm">
                <HomeIcon name={item.icon} className="h-7 w-7" />
              </span>
              <p className="text-sm font-semibold tracking-wide text-[#faf8e9] uppercase">{item.title}</p>
              {item.description && <p className="text-sm text-[#faf8e9]/70">{item.description}</p>}
            </div>
          ))}
        </div>
        {cta?.label && cta?.href && (
          <Link
            href={cta.href}
            className="mt-10 inline-block text-sm font-semibold tracking-wide text-[#faf8e9] uppercase underline underline-offset-4 transition hover:text-accent-warm"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  )
}
