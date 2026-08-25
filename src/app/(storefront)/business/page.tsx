import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Квіти для бізнесу та офісів | Kvitkova Povnya',
  description: 'Регулярне квіткове оформлення рецепцій, ресторанів та шоурумів. Оплата за рахунком.',
}

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-4 text-3xl font-semibold tracking-wide text-ink uppercase">Квіти для бізнесу та офісів</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Регулярна доставка свіжих квіткових композицій для рецепцій, ресторанів, шоурумів та офісів. Гнучкий графік,
        оплата за рахунком, персональний менеджер.
      </p>
      <Link
        href="/contacts"
        className="inline-flex items-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80"
      >
        Запросити комерційну пропозицію
      </Link>
    </div>
  )
}
