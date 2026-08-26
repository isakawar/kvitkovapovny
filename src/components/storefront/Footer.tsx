import Link from 'next/link'

import { Logo } from './Logo'

type FooterProps = {
  contactPhone?: string | null
  contactEmail?: string | null
  instagramUrl?: string | null
  telegramUrl?: string | null
  showroomAddress?: string | null
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

const serviceLinks = [
  { label: 'Підписка на квіти', href: '/katalog/pidpyska' },
  { label: 'Разові букети', href: '/katalog/buket' },
  { label: 'Оформлення бізнесу', href: '/business' },
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

export function Footer({ contactPhone, contactEmail, instagramUrl, telegramUrl, showroomAddress }: FooterProps) {
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
                className="text-ink transition hover:text-accent"
              >
                <TelegramIcon />
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
                <a href={`tel:${contactPhone}`} className="hover:text-accent">
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
            {showroomAddress && <li>{showroomAddress}</li>}
          </ul>
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
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
