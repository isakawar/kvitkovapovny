import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Політика конфіденційності | Kvitkova Povnya',
  description: 'Політика конфіденційності та обробки персональних даних Kvitkova Povnya.',
  alternates: { canonical: '/politika-konfidentsiynosti' },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-ink">
      <h1 className="mb-8 text-2xl font-semibold tracking-wide text-ink uppercase">Політика конфіденційності</h1>

      <div className="space-y-4 text-ink-soft">
        <p>
          Kvitkova Povnya збирає лише ті персональні дані (ім&apos;я, телефон, email, адреса доставки), які необхідні
          для
          оформлення та виконання замовлення, і не передає їх третім особам, окрім служб доставки та платіжних
          сервісів, залучених до обробки конкретного замовлення.
        </p>
        <p>
          Дані зберігаються у захищеному вигляді та використовуються виключно для звʼязку з клієнтом щодо замовлень
          і підписок. Ви можете у будь-який момент попросити видалити свої дані, звернувшись на контактний email.
        </p>
        <p>
          Продовжуючи користуватися сайтом та оформлюючи замовлення, ви погоджуєтеся з цією політикою
          конфіденційності.
        </p>
      </div>
    </div>
  )
}
