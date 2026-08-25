import Image from 'next/image'
import Link from 'next/link'

export type CategoryCardData = {
  slug: string
  name: string
  imageUrl?: string | null
}

export function CategoryGrid({ categories }: { categories: CategoryCardData[] }) {
  if (categories.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-8 text-center text-2xl font-semibold tracking-wide text-ink uppercase">Категорії</h2>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/katalog/${category.slug}`}
            className="group relative aspect-[3/4] w-[calc(50%-0.5rem)] overflow-hidden rounded-2xl bg-blush shadow-sm transition hover:shadow-md sm:w-[calc(25%-1.125rem)]"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition duration-300 group-hover:scale-105 group-hover:blur-[1px]"
              />
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/60 via-transparent to-transparent p-4">
              <span className="text-sm font-medium text-cream sm:text-base">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
