export function TickerStrip({ text }: { text: string }) {
  const items = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="overflow-hidden border-y border-ink/10 bg-blush/60 py-3">
      <div className="animate-ticker flex w-max items-center gap-8 whitespace-nowrap text-sm text-ink-soft">
        {items.map((i) => (
          <span key={i} className="flex items-center gap-8">
            <span>{text}</span>
            <span aria-hidden>✳</span>
          </span>
        ))}
      </div>
    </div>
  )
}
