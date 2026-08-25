import Image from 'next/image'
import Link from 'next/link'

import { formatUAH } from '@/lib/money'

export type ProductCardData = {
  slug: string
  name: string
  price: number
  imageUrl?: string | null
  imageAlt?: string
  inStock: boolean
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-blush">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="rounded-full bg-cream px-4 py-1 text-xs font-medium text-ink">
              Немає в наявності
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-sm font-medium text-ink">{product.name}</h3>
        <p className="mt-auto text-sm font-semibold text-accent">{formatUAH(product.price)}</p>
      </div>
    </Link>
  )
}
