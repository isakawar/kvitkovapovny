import type { Metadata } from 'next'

import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Доставка та оплата | Kvitkova Povnya',
  description: 'Умови доставки квіткових підписок і букетів та способи оплати.',
  alternates: { canonical: '/dostavka-ta-oplata' },
}

export default async function DeliveryAndPaymentPage() {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
  const cities = (siteSettings.deliveryCities || []).filter((c) => c.active !== false)

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-ink">
      <h1 className="mb-8 text-2xl font-semibold tracking-wide text-ink uppercase">Доставка та оплата</h1>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Доставка</h2>
          <p className="text-ink-soft">
            Доставляємо квіткові підписки та разові букети власною кур&apos;єрською службою у визначені дні та часові
            інтервали, які ви обираєте під час оформлення замовлення. Точний час доставки узгоджується з отримувачем
            заздалегідь.
          </p>
          {cities.length > 0 && (
            <p className="mt-2 text-ink-soft">Зона доставки: {cities.map((c) => c.name).join(', ')}.</p>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Оплата</h2>
          <p className="text-ink-soft">
            Оплатити замовлення можна карткою онлайн під час оформлення (Monobank) або за рахунком для юридичних
            осіб і корпоративних клієнтів. Підписки списуються автоматично згідно з обраним тарифом і періодичністю.
          </p>
        </section>
      </div>
    </div>
  )
}
