export type HomeIconName = 'truck' | 'vase' | 'pause' | 'flower' | 'home' | 'sparkle'

const iconPaths: Record<HomeIconName, React.ReactNode> = {
  truck: (
    <>
      <rect x="1" y="7" width="13" height="9" rx="1" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </>
  ),
  vase: (
    <>
      <path d="M9 3h6l-1 4h-4z" />
      <path d="M8 7h8l-1.5 6a4 4 0 0 1-1 2c-.5.6-.5 1.4 0 2l1 1c.6.6.6 1.6 0 2.2-.5.5-1.2.8-2 .8H9.5c-.8 0-1.5-.3-2-.8-.6-.6-.6-1.6 0-2.2l1-1c.5-.6.5-1.4 0-2a4 4 0 0 1-1-2z" />
    </>
  ),
  pause: (
    <>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
    </>
  ),
}

export function HomeIcon({ name, className }: { name: HomeIconName | string; className?: string }) {
  const path = iconPaths[name as HomeIconName] ?? iconPaths.flower

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {path}
    </svg>
  )
}
