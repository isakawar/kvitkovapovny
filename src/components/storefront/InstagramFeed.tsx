import Image from 'next/image'

export type InstagramPostData = {
  imageUrl: string
  link?: string | null
}

export function InstagramFeed({ posts, instagramUrl }: { posts: InstagramPostData[]; instagramUrl?: string | null }) {
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
        {posts.map((post, i) => {
          const content = (
            <div className="relative aspect-square overflow-hidden rounded-xl bg-blush">
              <Image
                src={post.imageUrl}
                alt="Instagram допис"
                fill
                sizes="(min-width: 768px) 16vw, 33vw"
                className="object-cover transition duration-300 hover:scale-105"
              />
            </div>
          )
          return post.link ? (
            <a key={i} href={post.link} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <div key={i}>{content}</div>
          )
        })}
      </div>
    </section>
  )
}
