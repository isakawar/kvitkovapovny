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
