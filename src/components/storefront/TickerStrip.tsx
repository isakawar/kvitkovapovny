function TickerSeparator() {
  return (
    <svg viewBox="0 0 8 8" className="h-1.5 w-1.5 shrink-0 fill-[#9EAF00]" aria-hidden>
      <circle cx="4" cy="4" r="4" />
    </svg>
  )
}

// CMS content historically used ad-hoc glyphs (★, ✳, 🌸…) as inline separators —
// strip whatever the editor typed and render one consistent SVG separator instead.
const SEPARATOR_GLYPHS = /[★✳✦✻🌸🌼*•]+/gu

export function TickerStrip({ text }: { text: string }) {
  const phrases = text
    .split(SEPARATOR_GLYPHS)
    .map((phrase) => phrase.trim())
    .filter(Boolean)

  if (phrases.length === 0) return null

  const items = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="flex h-9 items-center overflow-hidden bg-[#1E1E1E]">
      <div className="marquee flex w-max items-center gap-3 whitespace-nowrap">
        {items.map((i) => (
          <span key={i} className="flex items-center gap-3">
            {phrases.map((phrase, j) => (
              <span key={j} className="flex items-center gap-3">
                <span className="text-xs tracking-[0.5px] text-[#F9F8F3]">{phrase}</span>
                <TickerSeparator />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
