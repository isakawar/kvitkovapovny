import Image from 'next/image'
import Link from 'next/link'

import { BrandFlowerAccent } from './BrandFlowerAccent'
import { formatUAH } from '@/lib/money'

export type ProductCardData = {
  slug: string
  name: string
  price: number
  imageUrl?: string | null
  imageAlt?: string
  inStock: boolean
  freeDeliveryBadge?: boolean | null
  vaseGiftBadge?: boolean | null
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const badges = [
    product.freeDeliveryBadge && 'Безкоштовна доставка',
    product.vaseGiftBadge && 'Ваза у подарунок',
  ].filter((label): label is string => Boolean(label))

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
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {badges.map((label) => (
              <span
                key={label}
                className="rounded-full bg-cream/95 px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="rounded-full bg-cream px-4 py-1 text-xs font-medium text-ink">
              Немає в наявності
            </span>
          </div>
        )}
        <BrandFlowerAccent className="pointer-events-none absolute bottom-2 right-2 z-10 hidden h-6 w-6 text-cream/90 [html[data-theme='new']_&]:block" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[15px] leading-snug font-medium text-ink">{product.name}</h3>
        <p className="mt-auto text-base font-semibold text-accent">{formatUAH(product.price)}</p>
      </div>
    </Link>
  )
}
