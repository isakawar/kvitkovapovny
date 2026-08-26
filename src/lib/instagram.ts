import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'

export type InstagramFeedPost = {
  id: string
  mediaType: 'image' | 'video'
  mediaUrl: string
  posterUrl?: string | null
  caption?: string | null
  permalink?: string | null
}

const GRAPH_API_VERSION = 'v25.0'

type GraphMediaItem = {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink?: string
}

async function fetchFromGraphApi(igUserId: string, accessToken: string, limit: number): Promise<InstagramFeedPost[]> {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Instagram Graph API request failed: ${res.status}`)

  const data = (await res.json()) as { data?: GraphMediaItem[] }
  return (data.data || [])
    .filter((item) => item.media_url)
    .map((item) => ({
      id: item.id,
      mediaType: item.media_type === 'VIDEO' ? ('video' as const) : ('image' as const),
      mediaUrl: item.media_url as string,
      posterUrl: item.thumbnail_url ?? null,
      caption: item.caption ?? null,
      permalink: item.permalink ?? null,
    }))
}

async function getManualFallbackPosts(): Promise<InstagramFeedPost[]> {
  const payload = await getPayloadClient()
  const integration = await payload.findGlobal({ slug: 'instagram-integration' })
  return (integration.instagramPosts || [])
    .map((post): InstagramFeedPost | null => {
      const imageUrl = mediaUrl(post.image, 'card')
      if (!imageUrl) return null
      return {
        id: String(post.id ?? imageUrl),
        mediaType: 'image',
        mediaUrl: imageUrl,
        posterUrl: imageUrl,
        caption: null,
        permalink: post.link,
      }
    })
    .filter((post): post is InstagramFeedPost => post !== null)
}

export async function getInstagramFeed(): Promise<InstagramFeedPost[]> {
  const payload = await getPayloadClient()
  const integration = await payload.findGlobal({ slug: 'instagram-integration' })

  if (!integration.accessToken || !integration.igUserId) {
    return getManualFallbackPosts()
  }

  try {
    return await fetchFromGraphApi(integration.igUserId, integration.accessToken, integration.postLimit || 12)
  } catch (error) {
    console.error('Instagram Graph API fetch failed, falling back to manual posts:', error)
    return getManualFallbackPosts()
  }
}
