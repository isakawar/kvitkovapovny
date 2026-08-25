import Link from 'next/link'
import Image from 'next/image'

type CtaButton = {
  label: string
  href: string
  style?: 'primary' | 'secondary' | null
}

type HeroProps = {
  heading: string
  subheading?: string | null
  videoUrl?: string | null
  fallbackImageUrl?: string | null
  fallbackImageAlt: string
  ctaButtons: CtaButton[]
}

export function Hero({ heading, subheading, videoUrl, fallbackImageUrl, fallbackImageAlt, ctaButtons }: HeroProps) {
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
        <h1 className="text-3xl font-semibold tracking-wide uppercase sm:text-4xl">{heading}</h1>
        {subheading && <p className="text-sm tracking-wide text-cream/90">[{subheading}]</p>}
        {ctaButtons.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ctaButtons.map((cta) => (
              <Link
                key={cta.href + cta.label}
                href={cta.href}
                className={
                  cta.style === 'secondary'
                    ? 'rounded-full border border-cream/70 px-6 py-3 text-sm font-medium text-cream transition hover:bg-cream/10'
                    : 'rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80'
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
