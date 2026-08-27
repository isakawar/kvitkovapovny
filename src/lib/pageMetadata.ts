import type { Metadata } from 'next'

export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string
  title?: string
  description?: string
}): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url: path,
    },
  }
}
