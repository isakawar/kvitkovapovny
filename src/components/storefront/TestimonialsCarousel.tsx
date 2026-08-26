'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

export type TestimonialData = {
  imageUrl: string
  authorName?: string | null
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.4 6-5.5-3.2-5.5 3.2 1.4-6-4.6-4.1 6.1-.6L10 1.5z" />
    </svg>
  )
}

function instagramHandle(instagramUrl?: string | null): string | null {
  if (!instagramUrl) return null
  try {
    return new URL(instagramUrl).pathname.replace(/\//g, '') || null
  } catch {
    return null
  }
}

export function TestimonialsCarousel({
  testimonials,
  rating,
  statText,
  instagramUrl,
}: {
  testimonials: TestimonialData[]
  rating?: string | null
  statText?: string | null
  instagramUrl?: string | null
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  if (testimonials.length === 0) return null

  const openItem = openIndex !== null ? testimonials[openIndex] : null
  const handle = instagramHandle(instagramUrl)

  function scrollByCard(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 240, behavior: 'smooth' })
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-6 text-center text-2xl font-semibold tracking-wide text-ink uppercase">Відгуки</h2>

      {(rating || statText) && (
        <div className="mb-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
          {rating && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-4 py-1.5 text-sm font-medium text-ink">
              <StarIcon className="h-4 w-4 text-accent" />
              {rating} на основі відгуків у Google
            </span>
          )}
          {rating && statText && <span className="text-ink-soft">•</span>}
          {statText && (
            <span className="inline-flex items-center rounded-full bg-blush px-4 py-1.5 text-sm font-medium text-ink">
              {statText}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {testimonials.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative aspect-[9/19] w-[210px] shrink-0 snap-start overflow-hidden rounded-[2rem] border-4 border-ink bg-ink shadow-lg sm:w-[230px]"
            >
              <span className="absolute top-2 left-1/2 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-ink/80" />
              <Image
                src={t.imageUrl}
                alt={t.authorName || 'Відгук клієнта'}
                fill
                sizes="230px"
                className="rounded-[1.5rem] object-cover transition duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>

        {testimonials.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Попередні відгуки"
              onClick={() => scrollByCard(-1)}
              className="absolute top-1/2 -left-4 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink/20 bg-cream text-ink shadow-sm transition hover:border-ink/50 sm:flex"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Наступні відгуки"
              onClick={() => scrollByCard(1)}
              className="absolute top-1/2 -right-4 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink/20 bg-cream text-ink shadow-sm transition hover:border-ink/50 sm:flex"
            >
              ›
            </button>
          </>
        )}
      </div>

      {instagramUrl && (
        <div className="mt-10 flex justify-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-cream"
          >
            Дивитися всі відгуки в Instagram{handle ? ` @${handle}` : ''} ↗
          </a>
        </div>
      )}

      {openItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            aria-label="Закрити"
            onClick={() => setOpenIndex(null)}
            className="absolute top-4 right-4 text-2xl text-cream"
          >
            ✕
          </button>
          <div className="relative aspect-[9/16] max-h-[85vh] w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <Image
              src={openItem.imageUrl}
              alt={openItem.authorName || 'Відгук клієнта'}
              fill
              sizes="400px"
              className="rounded-2xl object-cover"
            />
          </div>
          {openItem.authorName && <p className="absolute bottom-6 text-sm text-cream">{openItem.authorName}</p>}
        </div>
      )}
    </section>
  )
}
