'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Підписка', href: '/katalog/pidpyska' },
  { label: 'Каталог букетів', href: '/katalog/buket' },
  { label: 'Зібрати букет', href: '/custom-bouquet' },
  { label: 'Для бізнесу', href: '/dlya-biznesu' },
  { label: 'Весілля', href: '/wedding' },
  { label: 'Про нас', href: '/contacts' },
]

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-6 w-6" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-6 w-6" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Відкрити меню"
        aria-expanded={open}
        className="flex items-center justify-center text-ink sm:hidden"
      >
        <MenuIcon />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-30 sm:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
            <nav className="absolute top-0 right-0 flex h-full w-72 max-w-[85vw] flex-col gap-1 bg-cream px-6 py-6 shadow-xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрити меню"
                className="mb-6 ml-auto flex items-center justify-center text-ink"
              >
                <CloseIcon />
              </button>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-ink transition hover:bg-blush"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>,
          document.body,
        )}
    </>
  )
}
