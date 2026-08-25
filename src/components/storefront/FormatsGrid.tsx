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
