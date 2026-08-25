'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useCart } from '@/lib/cart-context'
import { formatUAH } from '@/lib/money'
import { createOrder } from '@/app/actions/createOrder'

const TIME_WINDOWS = [
  { value: '09:00-12:00', label: '09:00–12:00' },
  { value: '12:00-15:00', label: '12:00–15:00' },
  { value: '15:00-18:00', label: '15:00–18:00' },
  { value: '18:00-21:00', label: '18:00–21:00' },
]

export function CheckoutForm({ cities }: { cities: string[] }) {
  const cart = useCart()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createOrder({
      customerName: String(formData.get('customerName') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || '') || undefined,
      deliveryCity: String(formData.get('deliveryCity') || ''),
      deliveryAddress: String(formData.get('deliveryAddress') || ''),
      deliveryDate: String(formData.get('deliveryDate') || ''),
      deliveryTimeWindow: String(formData.get('deliveryTimeWindow') || ''),
      cardMessage: String(formData.get('cardMessage') || '') || undefined,
      comment: String(formData.get('comment') || '') || undefined,
      items: cart.lines.map((l) => ({
        productId: l.productId,
        variantLabel: l.variantLabel,
        quantity: l.quantity,
      })),
    })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    cart.clear()
    router.push(`/order/${result.orderId}/confirmation`)
  }

  if (cart.lines.length === 0) {
    return <p className="text-sm text-ink-soft">Кошик порожній.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 sm:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-ink">Контакти та доставка</h2>
        <input name="customerName" required placeholder="Ім'я та прізвище" className="input" />
        <input name="phone" required placeholder="Телефон" className="input" />
        <input name="email" type="email" placeholder="Email (необов'язково)" className="input" />

        <select name="deliveryCity" required defaultValue="" className="input">
          <option value="" disabled>
            Місто доставки
          </option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <textarea name="deliveryAddress" required placeholder="Адреса доставки" className="input min-h-20" />

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

        <textarea name="cardMessage" placeholder="Текст листівки (необов'язково)" className="input min-h-16" />
        <textarea name="comment" placeholder="Коментар до замовлення (необов'язково)" className="input min-h-16" />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-ink">Ваше замовлення</h2>
        <ul className="space-y-3">
          {cart.lines.map((line) => (
            <li key={`${line.productId}-${line.variantLabel ?? ''}`} className="flex justify-between text-sm text-ink">
              <span>
                {line.name}
                {line.variantLabel ? ` (${line.variantLabel})` : ''} × {line.quantity}
              </span>
              <span>{formatUAH(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-ink/10 pt-4 text-base font-semibold text-ink">
          <span>Разом</span>
          <span>{formatUAH(cart.totalPrice)}</span>
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
          Оплата не потрібна — наш менеджер звʼяжеться з вами для підтвердження.
        </p>
      </div>
    </form>
  )
}
