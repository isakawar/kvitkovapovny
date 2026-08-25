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
