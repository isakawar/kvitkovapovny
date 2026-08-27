import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/pageMetadata'

import { BusinessInquiryForm } from '@/components/storefront/BusinessInquiryForm'

export const metadata: Metadata = pageMetadata({
  path: '/dlya-biznesu',
  title: 'Квіти для бізнесу | Kvitkova Povnya',
  description:
    'Автоматична підписка на живі квіти для закладів та офісів у Києві: повне обслуговування, вази, закриваючі документи.',
})

const audienceTags = ['Для ресторанів', 'Для готелів & б\'юті', 'Для IT-офісів', 'Для шоурумів']

const benefits = [
  {
    emoji: '📄',
    title: 'Офіційний договір',
    subtitle: 'Та безготівковий розрахунок',
  },
  {
    emoji: '🏺',
    title: 'Брендові вази безкоштовно',
    subtitle: 'В оренду під ваш інтер\'єр',
  },
  {
    emoji: '🔄',
    title: 'Заміна та догляд "під ключ"',
    subtitle: 'Щотижня, без участі вашого персоналу',
  },
  {
    emoji: '⚡️',
    title: 'Гнучкий бюджет',
    subtitle: 'Від фіксованих тарифів до великих індивідуальних об\'ємів',
  },
]

export default function BusinessPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-12 text-center">
        <h1 className="text-3xl font-semibold tracking-wide text-ink sm:text-4xl">
          Живі квіти для вашого закладу та офісу в Києві
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-ink-soft">
          Автоматична підписка на квіти з повним обслуговуванням, вазами та закриваючими документами
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {audienceTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blush px-4 py-2 text-sm font-medium text-ink"
            >
              {tag}
            </span>
          ))}
        </div>

        <a
          href="#business-form"
          className="mt-8 inline-flex rounded-full bg-accent px-8 py-3 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
        >
          Замовити тестовий тиждень
        </a>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-wide text-ink uppercase">
          Чому обирають нас
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blush text-2xl">
                {benefit.emoji}
              </span>
              <p className="text-base font-semibold text-ink">{benefit.title}</p>
              <p className="text-sm text-ink-soft">{benefit.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20">
        <BusinessInquiryForm />
      </section>
    </div>
  )
}
