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
