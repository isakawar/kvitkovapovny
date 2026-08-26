'use client'

import { useState } from 'react'
import Image from 'next/image'

export type GalleryImage = {
  url: string
  alt?: string
}

export function ProductGallery({
  images,
  activeOverrideUrl,
  aspectClassName = 'aspect-square',
}: {
  images: GalleryImage[]
  activeOverrideUrl?: string | null
  aspectClassName?: string
}) {
  const [userSelectedIndex, setUserSelectedIndex] = useState<number | null>(null)

  const overrideIndex = activeOverrideUrl ? images.findIndex((img) => img.url === activeOverrideUrl) : -1
  const activeIndex = userSelectedIndex ?? (overrideIndex >= 0 ? overrideIndex : 0)
  const active = images[activeIndex]

  if (images.length === 0) return <div className={`${aspectClassName} rounded-2xl bg-blush`} />

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative ${aspectClassName} overflow-hidden rounded-2xl bg-blush`}>
        {active && (
          <Image
            key={active.url}
            src={active.url}
            alt={active.alt || ''}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setUserSelectedIndex(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-blush transition ${
                i === activeIndex ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt={img.alt || ''} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
