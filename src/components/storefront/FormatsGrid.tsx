import Image from 'next/image'
import Link from 'next/link'

export type FormatCardData = {
  title: string
  subtitle: string
  buttonLabel: string
  buttonHref: string
  imageUrl?: string | null
}

export function FormatsGrid({ cards }: { cards: FormatCardData[] }) {
  if (cards.length === 0) return null

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
