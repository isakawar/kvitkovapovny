'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import type { InstagramFeedPost } from '@/lib/instagram'

function FeedTile({ post }: { post: InstagramFeedPost }) {
  if (post.mediaType === 'video') {
    return (
      <video
        src={post.mediaUrl}
        poster={post.posterUrl || undefined}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    )
  }
  return (
    <Image
      src={post.mediaUrl}
      alt="Instagram допис"
      fill
      sizes="(min-width: 768px) 16vw, 33vw"
      className="object-cover transition duration-300 hover:scale-105"
    />
  )
}

function Lightbox({
  post,
  onClose,
  onPrev,
  onNext,
}: {
  post: InstagramFeedPost
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрити"
        className="absolute top-4 right-4 text-2xl text-cream"
      >
        ×
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        aria-label="Попередній"
        className="absolute left-2 text-3xl text-cream sm:left-6"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        aria-label="Наступний"
        className="absolute right-2 text-3xl text-cream sm:right-6"
      >
        ›
      </button>

      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-cream sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 bg-blush sm:max-w-[60%]">
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrl}
              poster={post.posterUrl || undefined}
              className="max-h-[85vh] w-full object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <Image
              src={post.mediaUrl}
              alt="Instagram допис"
              width={800}
              height={800}
              className="max-h-[85vh] w-full object-contain"
            />
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto p-6 sm:w-80">
          {post.caption && <p className="text-sm whitespace-pre-line text-ink">{post.caption}</p>}
          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent underline"
            >
              Переглянути в Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function InstagramFeed({
  posts,
  instagramUrl,
}: {
  posts: InstagramFeedPost[]
  instagramUrl?: string | null
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (posts.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-wide text-ink uppercase">Ми в Instagram</h2>
        {instagramUrl && (
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline">
            Підписатись
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {posts.map((post, i) => (
          <button
            key={post.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="relative aspect-square overflow-hidden rounded-xl bg-blush"
          >
            <FeedTile post={post} />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          post={posts[activeIndex]}
          onClose={() => setActiveIndex(null)}
          onPrev={() => setActiveIndex((i) => (i === null ? null : (i - 1 + posts.length) % posts.length))}
          onNext={() => setActiveIndex((i) => (i === null ? null : (i + 1) % posts.length))}
        />
      )}
    </section>
  )
}
