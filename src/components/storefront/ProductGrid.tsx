import { ProductCard, type ProductCardData } from './ProductCard'

export function ProductGrid({ products, title }: { products: ProductCardData[]; title?: string }) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto min-h-[60vh] max-w-6xl px-4 py-16">
      {title && <h2 className="mb-8 text-center text-2xl font-semibold tracking-wide text-ink uppercase">{title}</h2>}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  )
}
