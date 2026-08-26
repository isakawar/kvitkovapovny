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

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.39V15.7a5.1 5.1 0 1 1-4.4-5.05v2.1a3 3 0 1 0 2.4 2.94V2h2.06a4.28 4.28 0 0 0 3.08 3.65v2.17a6.3 6.3 0 0 1-3.14-1.02v.02Z" />
    </svg>
  )
}

function HeaderIconPlaceholders({ tiktokUrl }: { tiktokUrl?: string | null }) {
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
      {tiktokUrl && (
        <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="transition hover:text-accent">
          <TikTokIcon />
        </a>
      )}
    </div>
  )
}

export function Header({
  theme,
  logoUrl,
  crossSellProducts,
  tiktokUrl,
}: {
  theme: 'old' | 'new'
  logoUrl?: string | null
  crossSellProducts?: CrossSellProduct[]
  tiktokUrl?: string | null
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
          <HeaderIconPlaceholders tiktokUrl={tiktokUrl} />
          <CartDrawer crossSellProducts={crossSellProducts} />
          <MobileNav />
        </div>
      ) : (
        <CartDrawer crossSellProducts={crossSellProducts} />
      )}
    </header>
  )
}
