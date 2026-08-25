export function BrandFlowerAccent({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="32" cy="32" r="7" />
      <circle cx="32" cy="16" r="9" />
      <circle cx="32" cy="48" r="9" />
      <circle cx="16" cy="32" r="9" />
      <circle cx="48" cy="32" r="9" />
      <path d="M32 39v14" strokeLinecap="round" />
      <path d="M28 50c-3 2-4 5-4 8" strokeLinecap="round" />
    </svg>
  )
}
