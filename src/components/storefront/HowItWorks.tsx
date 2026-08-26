import { HomeIcon, type HomeIconName } from './HomeIcons'
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

      <div className="mx-auto flex max-w-md flex-col sm:max-w-none sm:flex-row sm:gap-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush text-accent">
                <HomeIcon name={step.icon} className="h-6 w-6" />
              </span>
              {i < steps.length - 1 && <span className="my-1 w-px flex-1 bg-ink/15 sm:hidden" />}
            </div>
            <div className="flex flex-col gap-1 pb-8 sm:items-center sm:pb-0 sm:text-center">
              <span
                className="text-xs font-semibold tracking-widest text-accent"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-base font-semibold text-ink">{step.title}</p>
              {step.subtitle && <p className="text-sm text-ink-soft">{step.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
