import Link from 'next/link'
import Image from 'next/image'
import { BrandFlowerAccent } from './BrandFlowerAccent'

type CtaButton = {
  label: string
  href: string
  style?: 'primary' | 'secondary' | null
}

type HeroProps = {
  theme: 'old' | 'new'
  heading: string
  subheading?: string | null
  videoUrl?: string | null
  fallbackImageUrl?: string | null
  fallbackImageAlt: string
  ctaButtons: CtaButton[]
}

function CtaButtons({ ctaButtons, theme }: { ctaButtons: CtaButton[]; theme: 'old' | 'new' }) {
  if (ctaButtons.length === 0) return null

  return (
    <div
      className={
        theme === 'new'
          ? 'flex flex-wrap items-center gap-4'
          : 'flex flex-wrap items-center justify-center gap-4'
      }
    >
      {ctaButtons.map((cta) => (
        <Link
          key={cta.href + cta.label}
          href={cta.href}
          className={
            theme === 'new'
              ? cta.style === 'secondary'
                ? 'rounded-full border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink/5'
                : 'rounded-full bg-accent px-6 py-3 text-sm font-medium text-cream transition hover:bg-accent/90'
              : cta.style === 'secondary'
                ? 'rounded-full border border-cream/70 px-6 py-3 text-sm font-medium text-cream transition hover:bg-cream/10'
                : 'rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80'
          }
        >
          {cta.label}
        </Link>
      ))}
    </div>
  )
}

export function Hero({
  theme,
  heading,
  subheading,
  videoUrl,
  fallbackImageUrl,
  fallbackImageAlt,
  ctaButtons,
}: HeroProps) {
  if (theme === 'new') {
    return (
      <section className="w-full bg-cream">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col gap-6">
            <h1
              className="text-3xl tracking-wide text-ink sm:text-4xl lg:text-5xl"
              style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
            >
              {heading}
            </h1>
            {subheading && (
              <p className="text-base text-ink-soft" style={{ fontWeight: 'var(--font-weight-brand-light)' }}>
                {subheading}
              </p>
            )}
            <CtaButtons ctaButtons={ctaButtons} theme={theme} />
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-blush">
            {fallbackImageUrl && (
              <Image
                src={fallbackImageUrl}
                alt={fallbackImageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative flex h-[60vh] max-h-[560px] min-h-[380px] w-full items-center justify-center overflow-hidden bg-blush">
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={fallbackImageUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        fallbackImageUrl && (
          <Image src={fallbackImageUrl} alt={fallbackImageAlt} fill priority sizes="100vw" className="object-cover" />
        )
      )}
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <div className="relative z-10 mx-4 flex max-w-xl flex-col items-center gap-6 rounded-2xl bg-ink/20 px-8 py-10 text-center text-cream backdrop-blur-md">
        <h1
          className="text-3xl tracking-wide uppercase sm:text-4xl"
          style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
        >
          {heading}
        </h1>
        {subheading && (
          <p
            className="text-sm tracking-wide text-cream/90"
            style={{ fontWeight: 'var(--font-weight-brand-light)' }}
          >
            [{subheading}]
          </p>
        )}
        <CtaButtons ctaButtons={ctaButtons} theme={theme} />
      </div>
      <BrandFlowerAccent className="pointer-events-none absolute right-6 top-6 z-10 hidden h-16 w-16 text-cream/70 [html[data-theme='new']_&]:block sm:h-20 sm:w-20" />
    </section>
  )
}
