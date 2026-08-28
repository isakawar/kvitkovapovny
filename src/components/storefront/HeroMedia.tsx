'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type HeroMediaProps = {
  videoUrl?: string | null
  posterUrl?: string | null
  alt: string
  sizes?: string
}

type NetworkInformation = { saveData?: boolean; effectiveType?: string }

/**
 * Renders the hero fallback image immediately so the page is usable on first
 * paint, then upgrades to the looping video once the page has finished loading
 * and the browser is idle. Skips the video entirely on data-saver or slow
 * connections so mobile users are never stuck waiting on it.
 */
export function HeroMedia({
  videoUrl,
  posterUrl,
  alt,
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: HeroMediaProps) {
  const [mountVideo, setMountVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    if (!videoUrl) return

    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection
    if (conn?.saveData) return
    if (conn?.effectiveType && /(^|-)(2g|3g)$/.test(conn.effectiveType)) return

    let handle: number | undefined
    const hasIdleCallback = typeof window.requestIdleCallback === 'function'

    const schedule = () => {
      handle = hasIdleCallback
        ? window.requestIdleCallback(() => setMountVideo(true))
        : window.setTimeout(() => setMountVideo(true), 1000)
    }

    const cancel = () => {
      if (handle == null) return
      if (hasIdleCallback) window.cancelIdleCallback(handle)
      else clearTimeout(handle)
    }

    if (document.readyState === 'complete') {
      schedule()
      return cancel
    }

    window.addEventListener('load', schedule, { once: true })
    return () => {
      window.removeEventListener('load', schedule)
      cancel()
    }
  }, [videoUrl])

  return (
    <>
      {posterUrl && (
        <Image src={posterUrl} alt={alt} fill priority sizes={sizes} className="object-cover" />
      )}
      {videoUrl && mountVideo && (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          src={videoUrl}
          poster={posterUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => setVideoReady(true)}
        />
      )}
    </>
  )
}
