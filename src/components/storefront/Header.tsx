import Link from 'next/link'
import Image from 'next/image'

import { CartDrawer, type CrossSellProduct } from './CartDrawer'
import { Logo } from './Logo'

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

function HeaderIconPlaceholders() {
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
    </div>
  )
}

export function Header({
  theme,
  logoUrl,
  crossSellProducts,
}: {
  theme: 'old' | 'new'
  logoUrl?: string | null
  crossSellProducts?: CrossSellProduct[]
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
          Підписка для дому
        </Link>
        <Link href="/business" className="hover:text-accent">
          Для бізнесу
        </Link>
        <Link href="/wedding" className="hover:text-accent">
          Весілля
        </Link>
        <Link href="/gift-certificates" className="hover:text-accent">
          Подарункові сертифікати
        </Link>
      </nav>
      {theme === 'new' ? (
        <div className="flex items-center gap-4">
          {theme === 'new' && <HeaderIconPlaceholders />}
          <CartDrawer crossSellProducts={crossSellProducts} />
        </div>
      ) : (
        <CartDrawer crossSellProducts={crossSellProducts} />
      )}
    </header>
  )
}
