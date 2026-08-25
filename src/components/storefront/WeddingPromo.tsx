import Image from 'next/image'
import Link from 'next/link'

export function WeddingPromo({ imageUrl, heading }: { imageUrl?: string | null; heading: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="relative flex min-h-[320px] items-center overflow-hidden rounded-2xl bg-ink">
        {imageUrl && (
          <Image src={imageUrl} alt={heading} fill sizes="100vw" className="object-cover opacity-70" />
        )}
        <div className="relative z-10 max-w-md px-8 py-10 text-cream">
          <p className="mb-2 text-xs tracking-widest uppercase text-cream/80">Весілля</p>
          <h2 className="mb-4 text-2xl font-semibold">{heading}</h2>
          <Link
            href="/wedding"
            className="inline-flex rounded-full bg-cream px-6 py-3 text-sm font-medium text-ink transition hover:bg-cream/90"
          >
            Розрахувати весілля
          </Link>
        </div>
      </div>
    </section>
  )
}
