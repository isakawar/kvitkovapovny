import Link from 'next/link'
import Image from 'next/image'

import { CartDrawer, type CrossSellProduct } from './CartDrawer'
import { Logo } from './Logo'
import { MobileNav } from './MobileNav'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />
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

function HeaderIconPlaceholders({ threadsUrl }: { threadsUrl?: string | null }) {
  return (
    <div className="hidden items-center gap-4 text-ink sm:[html[data-theme='new']_&]:flex">
      <span role="img" aria-label="Пошук" className="cursor-default">
        <SearchIcon />
      </span>
      <span role="img" aria-label="Акаунт" className="cursor-default">
        <UserIcon />
      </span>
      <span role="img" aria-label="Список бажань" className="cursor-default">
        <HeartIcon />
      </span>
      {threadsUrl && (
        <a href={threadsUrl} target="_blank" rel="noopener noreferrer" aria-label="Threads" className="transition hover:text-accent">
          <ThreadsIcon />
        </a>
      )}
    </div>
  )
}

export function Header({
  theme,
  logoUrl,
  crossSellProducts,
  threadsUrl,
}: {
  theme: 'old' | 'new'
  logoUrl?: string | null
  crossSellProducts?: CrossSellProduct[]
  threadsUrl?: string | null
}) {
  return (
    <header
      className={
        theme === 'new'
          ? 'sticky top-0 z-20 flex items-center justify-between gap-4 bg-cream/90 px-6 py-3 text-ink backdrop-blur sm:px-10'
          : 'sticky top-0 z-20 flex items-center justify-between bg-cream/90 px-6 py-3 text-ink backdrop-blur sm:px-10'
      }
    >
      <Link href="/" className="flex items-center">
        {logoUrl ? (
          <Image src={logoUrl} alt="kvitkova povnya" width={1628} height={485} className="h-14 w-auto sm:h-16" priority />
        ) : (
          <Logo />
        )}
      </Link>
      <nav className="hidden gap-6 text-sm sm:flex">
        <Link href="/katalog/pidpyska" className="hover:text-accent">
          Підписка
        </Link>
        <Link href="/katalog/buket" className="hover:text-accent">
          Каталог букетів
        </Link>
        <Link href="/custom-bouquet" className="hover:text-accent">
          Зібрати букет
        </Link>
        <Link href="/dlya-biznesu" className="hover:text-accent">
          Для бізнесу
        </Link>
        <Link href="/wedding" className="hover:text-accent">
          Весілля
        </Link>
        <Link href="/contacts" className="hover:text-accent">
          Про нас
        </Link>
      </nav>
      {theme === 'new' ? (
        <div className="flex items-center gap-4">
          <HeaderIconPlaceholders threadsUrl={threadsUrl} />
          <CartDrawer crossSellProducts={crossSellProducts} />
          <MobileNav />
        </div>
      ) : (
        <CartDrawer crossSellProducts={crossSellProducts} />
      )}
    </header>
  )
}
