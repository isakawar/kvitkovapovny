import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Гарантія свіжості | Kvitkova Povnya',
  description: 'Гарантія свіжості квітів у підписках і букетах Kvitkova Povnya.',
}

export default function FreshnessGuaranteePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-ink">
      <h1 className="mb-8 text-2xl font-semibold tracking-wide text-ink uppercase">Гарантія свіжості</h1>

      <div className="space-y-4 text-ink-soft">
        <p>
          Ми закуповуємо квіти безпосередньо у перевірених постачальників і формуємо букети в день доставки, тому
          гарантуємо свіжість щонайменше 7 днів за умови дотримання простих правил догляду.
        </p>
        <p>
          Якщо букет зів&apos;яв раніше заявленого терміну — напишіть нам протягом доби з фото, і ми безкоштовно
          замінимо квіти або компенсуємо вартість.
        </p>
        <p>
          Зв&apos;язатися з нами можна через{' '}
          <Link href="/contacts" className="text-accent underline">
            сторінку контактів
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
