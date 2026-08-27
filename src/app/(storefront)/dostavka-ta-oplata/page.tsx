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

        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Умови оплати та повернення коштів</h2>
          <div className="space-y-3 text-ink-soft [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
            <h3>1. Оплата</h3>
            <p>1.1. Оплата здійснюється на сайті онлайн банківською картою або через інші платіжні сервіси.</p>
            <p>1.2. Замовлення вважається прийнятим після підтвердження платежу.</p>

            <h3>2. Повернення коштів</h3>
            <p>2.1. Коли можливе повернення або обмін. Повернення чи обмін можливий у таких випадках:</p>
            <ul>
              <li>Букет або квіткова композиція були пошкоджені під час доставки (зів&apos;ялі квіти, поламані стебла тощо).</li>
              <li>
                Отриманий товар не відповідає опису або замовленню (наприклад, використані не ті квіти, що були
                зазначені при оформленні покупки).
              </li>
            </ul>
            <p>
              2.2. Як оформити повернення або обмін. Якщо ви отримали пошкоджений товар або композицію, що не
              відповідає замовленню, просимо:
            </p>
            <ul>
              <li>Звернутися до нашої служби підтримки протягом 12 годин з моменту отримання доставки.</li>
              <li>Надіслати фото товару та короткий опис проблеми через месенджери (Telegram, Instagram тощо).</li>
            </ul>
            <p>
              2.3. Після ухвалення позитивного рішення про повернення, ми здійснимо повернення коштів протягом 3
              робочих днів тим самим способом, яким було здійснено оплату згідно закону України &quot;Про захист прав
              споживачів&quot;.
            </p>
            <p>2.4. У разі виникнення спірних питань клієнт може звернутися за телефоном.</p>

            <h3>3. Обмін/повторна доставка</h3>
            <p>
              3.1. У випадку доставки зіпсованої або невідповідної композиції Виконавець здійснює повторну доставку
              або повертає кошти.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
