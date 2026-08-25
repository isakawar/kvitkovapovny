import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Подарунковий сертифікат | Kvitkova Povnya',
  description: 'Елегантний бокс із подарунковим сертифікатом на квіткову підписку для близьких.',
}

export default function GiftCertificatesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-4 text-3xl font-semibold tracking-wide text-ink uppercase">Подарунковий сертифікат</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Елегантний бокс із сертифікатом на квіткову підписку — ідеальний подарунок для близьких. Оберіть номінал та
        тривалість, ми оформимо і доставимо.
      </p>
      <Link
        href="/contacts"
        className="inline-flex items-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80"
      >
        Купити сертифікат
      </Link>
    </div>
  )
}
