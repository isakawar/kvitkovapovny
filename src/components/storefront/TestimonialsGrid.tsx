'use client'

import { useState } from 'react'
import Image from 'next/image'

export type TestimonialData = {
  imageUrl: string
  authorName?: string | null
}

export function TestimonialsGrid({ testimonials }: { testimonials: TestimonialData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (testimonials.length === 0) return null

  const openItem = openIndex !== null ? testimonials[openIndex] : null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-8 text-center text-2xl font-semibold tracking-wide text-ink uppercase">Відгуки</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {testimonials.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-blush"
          >
            <Image
              src={t.imageUrl}
              alt={t.authorName || 'Відгук клієнта'}
              fill
              sizes="(min-width: 768px) 16vw, 33vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            aria-label="Закрити"
            onClick={() => setOpenIndex(null)}
            className="absolute right-4 top-4 text-2xl text-cream"
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
          {openItem.authorName && (
            <p className="absolute bottom-6 text-sm text-cream">{openItem.authorName}</p>
          )}
        </div>
      )}
    </section>
  )
}
