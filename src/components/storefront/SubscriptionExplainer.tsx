import Image from 'next/image'
import Link from 'next/link'

type ListItem = { label: string }

type SubscriptionExplainerProps = {
  theme: 'old' | 'new'
  heading: string
  intro: string
  imageUrl?: string | null
  frequenciesHeading?: string | null
  frequencies: ListItem[]
  minimumHeading?: string | null
  minimumIncludes: ListItem[]
  eachDeliveryHeading?: string | null
  eachDeliveryIncludes: ListItem[]
  ctaLabel?: string | null
  ctaHref?: string | null
}

export function SubscriptionExplainer({
  theme,
  heading,
  intro,
  imageUrl,
  frequenciesHeading,
  frequencies,
  minimumHeading,
  minimumIncludes,
  eachDeliveryHeading,
  eachDeliveryIncludes,
  ctaLabel,
  ctaHref,
}: SubscriptionExplainerProps) {
  // In the new theme, this bullet-list breakdown is superseded by the
  // HowItWorks graphic steps rendered earlier on the page — showing both
  // duplicates the same "how the subscription works" content twice.
  const showLists = theme === 'old'
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 sm:items-center">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-blush">
        {imageUrl && <Image src={imageUrl} alt={heading} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />}
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-semibold text-ink">{heading}</h2>
        {intro.split('\n\n').map((paragraph, i) => (
          <p key={i} className="text-sm text-ink-soft whitespace-pre-line">
            {paragraph}
          </p>
        ))}

        {showLists && frequencies.length > 0 && (
          <div>
            {frequenciesHeading && <p className="mb-2 text-sm font-medium text-ink">{frequenciesHeading}</p>}
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
              {frequencies.map((f, i) => (
                <li key={i}>{f.label}</li>
              ))}
            </ul>
          </div>
        )}

        {showLists && minimumIncludes.length > 0 && (
          <div>
            {minimumHeading && <p className="mb-2 text-sm font-medium text-ink">{minimumHeading}</p>}
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
              {minimumIncludes.map((m, i) => (
                <li key={i}>{m.label}</li>
              ))}
            </ul>
          </div>
        )}

        {showLists && eachDeliveryIncludes.length > 0 && (
          <div>
            {eachDeliveryHeading && <p className="mb-2 text-sm font-medium text-ink">{eachDeliveryHeading}</p>}
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
              {eachDeliveryIncludes.map((e, i) => (
                <li key={i}>{e.label}</li>
              ))}
            </ul>
          </div>
        )}

        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-2 inline-flex w-fit rounded-full border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-cream"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
