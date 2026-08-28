'use client'

import Link from 'next/link'

import { track } from '@/lib/analytics'
import { Logo } from './Logo'

type FooterProps = {
  contactPhone?: string | null
  contactEmail?: string | null
  instagramUrl?: string | null
  telegramUrl?: string | null
  tiktokUrl?: string | null
  threadsUrl?: string | null
  showroomAddress?: string | null
  googleMapsUrl?: string | null
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
      <path d="m21 4-8.5 16-3-6.5L3 10.5Z" strokeLinejoin="round" />
      <path d="M21 4 9.5 13.5" strokeLinejoin="round" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.39V15.7a5.1 5.1 0 1 1-4.4-5.05v2.1a3 3 0 1 0 2.4 2.94V2h2.06a4.28 4.28 0 0 0 3.08 3.65v2.17a6.3 6.3 0 0 1-3.14-1.02v.02Z" />
    </svg>
  )
}

function ThreadsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12.2 22c-2.6 0-4.7-.86-6.2-2.42-1.5-1.55-2.28-3.75-2.3-6.55v-.06c.02-2.8.8-5 2.3-6.55C7.5 4.86 9.6 4 12.2 4c2.35 0 4.24.7 5.6 2.06 1.14 1.15 1.87 2.7 2.16 4.63l-1.8.28c-.24-1.55-.8-2.76-1.68-3.64C15.5 6.35 14.05 5.8 12.2 5.8c-2.1 0-3.7.68-4.87 1.9-1.13 1.2-1.75 2.95-1.77 5.24v.1c.02 2.29.64 4.04 1.77 5.24 1.17 1.22 2.77 1.9 4.87 1.9 1.9 0 3.32-.5 4.3-1.42.8-.75 1.28-1.77 1.4-2.94-.5.28-1.1.5-1.8.63-1.02.2-2.1.14-3.06-.24-1.14-.45-1.98-1.33-2.16-2.5-.13-.85.08-1.7.6-2.36.6-.75 1.6-1.24 2.87-1.4 1.2-.16 2.5-.02 3.6.4-.06-.7-.28-1.28-.65-1.72-.5-.6-1.3-.9-2.35-.9-1.1 0-2.1.36-2.87 1.07l-1.28-1.2c1.1-1.03 2.5-1.6 4.15-1.6 1.55 0 2.83.5 3.68 1.5.8.93 1.2 2.24 1.2 3.9v.5c1.15.4 1.98 1.03 2.5 1.9.6 1 .74 2.25.4 3.6-.35 1.4-1.15 2.6-2.3 3.5C16.7 21.4 14.7 22 12.2 22Zm2.05-9.9c-.9.12-1.55.4-1.9.83-.22.28-.3.6-.24.95.08.5.5.9 1.13 1.14.6.24 1.34.28 2.05.14.72-.14 1.36-.4 1.87-.75-.05-.65-.2-1.16-.47-1.55-.47-.42-1.42-.9-2.44-.76Z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <path d="M12 21s7-6.1 7-11.5a7 7 0 1 0-14 0C5 14.9 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  )
}

const serviceLinks = [
  { label: 'Підписка на квіти', href: '/katalog/pidpyska' },
  { label: 'Разові букети', href: '/katalog/buket' },
  { label: 'Оформлення бізнесу', href: '/dlya-biznesu' },
  { label: 'Весільний декор', href: '/wedding' },
]

const clientLinks = [
  { label: 'Доставка та оплата', href: '/dostavka-ta-oplata' },
  { label: 'Гарантія свіжості', href: '/garantiya-svizhosti' },
  { label: 'Часті запитання (FAQ)', href: '/#faq' },
  { label: 'Договір оферти', href: '/oferta' },
  { label: 'Політика конфіденційності', href: '/politika-konfidentsiynosti' },
]

function FooterColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mb-4 text-sm tracking-[0.15em] text-ink uppercase"
      style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
    >
      {children}
    </h3>
  )
}

export function Footer({
  contactPhone,
  contactEmail,
  instagramUrl,
  telegramUrl,
  tiktokUrl,
  threadsUrl,
  showroomAddress,
  googleMapsUrl,
}: FooterProps) {
  const mapsHref =
    googleMapsUrl || (showroomAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showroomAddress)}` : null)

  return (
    <footer className="border-t border-ink/10 bg-cream px-6 py-14 text-sm text-ink-soft sm:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="mb-4" />
          <p className="mb-4 max-w-xs text-ink-soft">
            Квіткові підписки та авторські букети з доставкою — свіжі квіти на регулярній основі та для особливих
            подій.
          </p>
          <div className="flex items-center gap-4">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                onClick={() => track('click_instagram', { location: 'footer' })}
                className="text-ink transition hover:text-accent"
              >
                <InstagramIcon />
              </a>
            )}
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                onClick={() => track('click_telegram', { location: 'footer' })}
                className="text-ink transition hover:text-accent"
              >
                <TelegramIcon />
              </a>
            )}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-ink transition hover:text-accent"
              >
                <TikTokIcon />
              </a>
            )}
            {threadsUrl && (
              <a
                href={threadsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads"
                onClick={() => track('click_threads', { location: 'footer' })}
                className="text-ink transition hover:text-accent"
              >
                <ThreadsIcon />
              </a>
            )}
          </div>
        </div>

        <div>
          <FooterColumnHeading>Послуги</FooterColumnHeading>
          <ul className="space-y-2">
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterColumnHeading>Клієнтам</FooterColumnHeading>
          <ul className="space-y-2">
            {clientLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterColumnHeading>Контакти</FooterColumnHeading>
          <ul className="space-y-2">
            {contactPhone && (
              <li>
                <a
                  href={`tel:${contactPhone}`}
                  onClick={() => track('click_phone', { location: 'footer' })}
                  className="hover:text-accent"
                >
                  {contactPhone}
                </a>
              </li>
            )}
            {contactEmail && (
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-accent">
                  {contactEmail}
                </a>
              </li>
            )}
            {showroomAddress && (
              <li>
                {mapsHref ? (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1.5 transition hover:text-[#9EAF00] hover:underline"
                  >
                    <PinIcon />
                    {showroomAddress}
                  </a>
                ) : (
                  <span className="inline-flex items-start gap-1.5">
                    <PinIcon />
                    {showroomAddress}
                  </span>
                )}
              </li>
            )}
          </ul>
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('click_telegram', { location: 'footer_cta' })}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink/80"
            >
              <TelegramIcon />
              Написати в Telegram
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-ink/10 pt-6 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} KVITKOVA POVNYA. Всі права захищені.
      </div>
    </footer>
  )
}
