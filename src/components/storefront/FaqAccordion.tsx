export type FaqItem = {
  question: string
  answer: string
}

export function FaqAccordion({ items, heading = 'Часті запитання' }: { items: FaqItem[]; heading?: string }) {
  if (items.length === 0) return null

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 scroll-mt-24">
      <h2 className="mb-8 text-center text-2xl font-semibold tracking-wide text-ink uppercase">{heading}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.question} className="group rounded-xl bg-white p-4 open:shadow-sm">
            <summary className="cursor-pointer list-none text-sm font-medium text-ink marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span className="text-ink-soft transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm text-ink-soft whitespace-pre-line">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
