import Link from 'next/link'
import Image from 'next/image'

import { CartDrawer } from './CartDrawer'
import { Logo } from './Logo'

export function Header({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-cream/90 px-6 py-3 text-ink backdrop-blur sm:px-10">
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
        <Link href="/wedding" className="hover:text-accent">
          Весілля
        </Link>
        <Link href="/contacts" className="hover:text-accent">
          Контакти
        </Link>
      </nav>
      <CartDrawer />
    </header>
  )
}
