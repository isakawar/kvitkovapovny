'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'favorites'

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeFavorites(slugs: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  } catch {
    // No-op if storage is unavailable (private mode, quota, etc.).
  }
}

export function FavoriteButton({ productSlug }: { productSlug: string }) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage after hydration
    setIsFavorite(readFavorites().includes(productSlug))
  }, [productSlug])

  function toggle(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    const favorites = readFavorites()
    const next = favorites.includes(productSlug)
      ? favorites.filter((slug) => slug !== productSlug)
      : [...favorites, productSlug]
    writeFavorites(next)
    setIsFavorite(next.includes(productSlug))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Прибрати з обраного' : 'Додати в обране'}
      className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream/95 shadow-sm transition hover:scale-105"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition ${isFavorite ? 'fill-accent stroke-accent' : 'fill-none stroke-ink'}`}
        strokeWidth={1.8}
      >
        <path d="M12 20s-7.5-4.6-10-9.1C.4 7.6 2 4 5.6 4 8 4 10 5.4 12 8c2-2.6 4-4 6.4-4C22 4 23.6 7.6 22 10.9 19.5 15.4 12 20 12 20Z" />
      </svg>
    </button>
  )
}
