import type { Media } from '@/payload-types'

export function mediaUrl(
  media: number | Media | null | undefined,
  size?: 'thumbnail' | 'card' | 'full',
): string | null {
  if (!media || typeof media === 'number') return null
  if (size && media.sizes?.[size]?.url) return media.sizes[size]!.url
  return media.url ?? null
}
