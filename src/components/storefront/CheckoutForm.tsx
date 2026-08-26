'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'
import { createOrder } from '@/app/actions/createOrder'
import { createPaymentInvoice } from '@/app/actions/createPaymentInvoice'
import { NovaPoshtaFields } from './NovaPoshtaFields'

const TIME_WINDOWS = [
  { value: '09:00-12:00', label: '09:00–12:00' },
  { value: '12:00-15:00', label: '12:00–15:00' },
  { value: '15:00-18:00', label: '15:00–18:00' },
  { value: '18:00-21:00', label: '18:00–21:00' },
]

const PAYMENT_METHODS = [
  { value: 'online', label: 'Онлайн-оплата через Monobank' },
  { value: 'installments', label: 'Оплата частинами Monobank (розстрочка на 3-6 місяців)' },
  { value: 'business_invoice', label: 'Оплата за рахунком для бізнесу (ФОП / ТОВ)' },
]

const DELIVERY_METHODS = [
  { value: 'courier', label: "Кур'єрська доставка (Київ та область)" },
  { value: 'nova_poshta', label: 'Нова пошта (по Україні)' },
  { value: 'pickup', label: 'Самовивіз з шоуруму' },
] as const

type DeliveryMethod = (typeof DELIVERY_METHODS)[number]['value']

export function CheckoutForm({ cities, showroomAddress }: { cities: string[]; showroomAddress?: string | null }) {
  const cart = useCart()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGift, setIsGift] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('courier')

  const defaultCity = cities.includes('Київ') ? 'Київ' : cities[0] || ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createOrder({
      customerName: String(formData.get('customerName') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || '') || undefined,
      isGift,
      recipientName: String(formData.get('recipientName') || '') || undefined,
      recipientPhone: String(formData.get('recipientPhone') || '') || undefined,
      giftSurprise: formData.get('giftSurprise') === 'on',
      deliveryMethod,
      deliveryCity: String(formData.get('deliveryCity') || '') || undefined,
      deliveryAddress: String(formData.get('deliveryAddress') || '') || undefined,
      deliveryDate: String(formData.get('deliveryDate') || ''),
      deliveryTimeWindow: String(formData.get('deliveryTimeWindow') || '') || undefined,
      npOfficeNumber: String(formData.get('npOfficeNumber') || '') || undefined,
      npCityRef: String(formData.get('npCityRef') || '') || undefined,
      npWarehouseRef: String(formData.get('npWarehouseRef') || '') || undefined,
      pickupTime: String(formData.get('pickupTime') || '') || undefined,
      cardMessage: String(formData.get('cardMessage') || '') || undefined,
      comment: String(formData.get('comment') || '') || undefined,
      paymentMethod: String(formData.get('paymentMethod') || ''),
      items: cart.lines.map((l) => ({
        productId: l.productId,
        variantLabel: l.variantLabel,
        quantity: l.quantity,
      })),
    })

    if (!result.ok) {
      setSubmitting(false)
      setError(result.error)
      return
    }

    if (result.paymentMethod === 'online' || result.paymentMethod === 'installments') {
      const payment = await createPaymentInvoice(result.orderId)
      setSubmitting(false)

      if (!payment.ok) {
        setError(payment.error)
        return
      }

      cart.clear()
      window.location.href = payment.pageUrl
      return
    }

    setSubmitting(false)
    cart.clear()
    router.push(`/order/${result.orderId}/confirmation`)
  }

  if (cart.lines.length === 0) {
    return <p className="text-sm text-ink-soft">Кошик порожній.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 sm:grid-cols-2">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-ink">1. Ваші дані</h2>
          <input name="customerName" required placeholder="Ім'я замовника" className="input" />
          <input name="phone" required placeholder="Телефон замовника" className="input" />
          <input name="email" type="email" placeholder="Email (необов'язково)" className="input" />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-ink">2. Деталі доставки</h2>

          <div className="flex flex-col gap-2">
            {DELIVERY_METHODS.map((method) => (
              <label key={method.value} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="deliveryMethodDisplay"
                  checked={deliveryMethod === method.value}
                  onChange={() => setDeliveryMethod(method.value)}
                  className="accent-ink"
                />
                {method.label}
              </label>
            ))}
          </div>

          {deliveryMethod === 'courier' && (
            <>
              <select name="deliveryCity" required defaultValue={defaultCity} className="input">
                <option value="" disabled>
                  Місто / Населений пункт
                </option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <textarea
                name="deliveryAddress"
                required
                placeholder="Адреса (вулиця, будинок, квартира)"
                className="input min-h-20"
              />
              <div className="grid grid-cols-2 gap-4">
                <input name="deliveryDate" type="date" required className="input" />
                <select name="deliveryTimeWindow" required defaultValue="" className="input">
                  <option value="" disabled>
                    Час доставки
                  </option>
                  {TIME_WINDOWS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {deliveryMethod === 'nova_poshta' && (
            <>
              <NovaPoshtaFields />
              <input name="deliveryDate" type="date" required className="input" />
              <p className="text-xs text-ink-soft">
                Надсилаємо у спеціальних герметичних аква-боксах з підтримкою свіжості.
              </p>
            </>
          )}

          {deliveryMethod === 'pickup' && (
            <>
              <p className="rounded-xl bg-blush/50 px-3 py-2 text-sm text-ink">
                Чекаємо на вас за адресою: {showroomAddress || 'уточнюється — зв\'яжіться з нами'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <input name="deliveryDate" type="date" required className="input" />
                <input name="pickupTime" required placeholder="Орієнтовний час візиту" className="input" />
              </div>
            </>
          )}

          {deliveryMethod !== 'pickup' && (
            <>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="isGift"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="accent-ink"
                />
                Замовляю на подарунок (іншому отримувачу)
              </label>

              {isGift && (
                <div className="flex flex-col gap-4 rounded-xl bg-blush/40 p-4">
                  <input name="recipientName" required placeholder="Ім'я отримувача" className="input" />
                  <input name="recipientPhone" required placeholder="Телефон отримувача" className="input" />
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" name="giftSurprise" className="accent-ink" />
                    Не розкривати деталі замовлення (Сюрприз)
                  </label>
                </div>
              )}
            </>
          )}

          <textarea name="cardMessage" placeholder="Текст листівки (необов'язково)" className="input min-h-16" />
          <textarea name="comment" placeholder="Коментар до замовлення (необов'язково)" className="input min-h-16" />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-ink">3. Спосіб оплати</h2>
          {PAYMENT_METHODS.map((method, i) => (
            <label key={method.value} className="flex items-center gap-2 text-sm text-ink">
              <input type="radio" name="paymentMethod" value={method.value} defaultChecked={i === 0} className="accent-ink" />
              {method.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-ink">Ваше замовлення</h2>
        <ul className="space-y-3">
          {cart.lines.map((line) => (
            <li key={`${line.productId}-${line.variantLabel ?? ''}`} className="flex items-center gap-3 text-sm text-ink">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-blush">
                {line.image && <Image src={line.image} alt={line.name} fill sizes="40px" className="object-cover" />}
              </div>
              <span className="flex-1">
                {line.name}
                {line.variantLabel ? ` (${line.variantLabel})` : ''} × {line.quantity}
              </span>
              <span>{formatUAH(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 border-t border-ink/10 pt-4 text-sm text-ink">
          <div className="flex justify-between">
            <span>Сума товарів:</span>
            <span>{formatUAH(cart.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Доставка:</span>
            <span>Безкоштовно</span>
          </div>
          <div className="flex justify-between">
            <span>Подарунок: Ваза + секатор</span>
            <span>0 грн</span>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-semibold">
            <span>РАЗОМ</span>
            <span>{formatUAH(cart.totalPrice)}</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-auto rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80 disabled:opacity-60"
        >
          {submitting ? 'Надсилаємо…' : 'Підтвердити замовлення'}
        </button>
        <p className="text-xs text-ink-soft">
          🔒 Ваші дані захищені. Після оформлення ви отримаєте підтвердження в SMS/Telegram
        </p>
      </div>
    </form>
  )
}
