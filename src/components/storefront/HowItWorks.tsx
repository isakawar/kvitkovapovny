import type { HomeIconName } from './HomeIcons'
import { BrandFlowerAccent } from './BrandFlowerAccent'

export type HowItWorksStepData = {
  icon: HomeIconName
  title: string
  subtitle?: string | null
}

export function HowItWorks({ heading, steps }: { heading: string; steps: HowItWorksStepData[] }) {
  if (steps.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 flex items-center justify-center gap-3">
        <BrandFlowerAccent className="h-6 w-6 shrink-0 text-accent" />
        <h2 className="text-center text-2xl font-semibold tracking-wide text-ink uppercase">{heading}</h2>
        <BrandFlowerAccent className="h-6 w-6 shrink-0 text-accent" />
      </div>

      <div className="flex items-center px-4 sm:px-10">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <span
              className="text-4xl text-accent sm:text-5xl"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            {i < steps.length - 1 && <div className="mx-3 h-px flex-1 bg-ink/15 sm:mx-6" />}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-6">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col gap-2 px-2">
            <p className="text-base font-semibold text-ink">{step.title}</p>
            {step.subtitle && <p className="text-sm text-ink-soft">{step.subtitle}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
