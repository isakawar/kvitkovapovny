function MoonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path
        d="M40 8C29 11 21 20.5 21 32C21 43.5 29 53 40 56C33.6 58.6 26.4 58.2 20.2 54.6C10 48.7 5 37 8.2 25.6C11.1 15.3 20 7.7 30.5 6.4C33.8 6 37 6.5 40 8Z"
        fill="currentColor"
      />
      <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.85">
        <circle cx="15" cy="22" r="3.2" />
        <circle cx="10.5" cy="27" r="2.4" />
        <circle cx="17.5" cy="29" r="2.6" />
        <path d="M9 33c3-1 6-1 9 0" strokeLinecap="round" />
        <path d="M8 18c2 2 2 5 1 8" strokeLinecap="round" />
        <path d="M20 18c0 3-1 5-3 7" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`relative flex items-center ${className ?? ''}`}>
      <span className="flex items-center gap-3 text-ink [html[data-theme='new']_&]:hidden">
        <MoonMark className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" />
        <span className="h-8 w-px bg-ink/30 sm:h-9" />
        <span className="flex flex-col leading-none">
          <span className="text-lg font-semibold tracking-[0.18em] sm:text-xl">KVITKOVA</span>
          <span className="mt-1 text-[10px] tracking-[0.5em] text-ink-soft sm:text-xs">POVNYA</span>
        </span>
      </span>
      <span className="hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-cream [html[data-theme='new']_&]:flex">
        <span
          className="text-sm tracking-[0.05em] sm:text-base"
          style={{ fontWeight: 'var(--font-weight-brand-bold)' }}
        >
          KVITKOVA.
        </span>
        <span
          className="text-sm tracking-[0.05em] sm:text-base"
          style={{ fontWeight: 'var(--font-weight-brand-light)' }}
        >
          POVNYA
        </span>
      </span>
    </span>
  )
}
