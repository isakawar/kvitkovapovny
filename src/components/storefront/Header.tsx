import Link from 'next/link'
import Image from 'next/image'

import { CartDrawer, type CrossSellProduct } from './CartDrawer'
import { Logo } from './Logo'

export function Header({ logoUrl, crossSellProducts }: { logoUrl?: string | null; crossSellProducts?: CrossSellProduct[] }) {
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
      <CartDrawer crossSellProducts={crossSellProducts} />
    </header>
  )
}
