'use client'

import { useState } from 'react'

import { createOrder } from '@/app/actions/createOrder'
import { createPaymentInvoice } from '@/app/actions/createPaymentInvoice'
import { formatUAH } from '@/lib/money'

export type SubscriptionCheckoutModalProps = {
  productId: string
  productName: string
  sizeLabel: string
  frequencyLabel: string
  deliveriesPerMonth: number
  price: number
  variantLabel?: string
  onClose: () => void
}

const TIME_WINDOWS = [
  { value: '10:00-14:00', label: '10:00–14:00' },
  { value: '14:00-18:00', label: '14:00–18:00' },
  { value: '18:00-21:00', label: '18:00–21:00' },
]

const MANAGER_CONTACT_NOTE = 'Клієнт хоче узгодити деталі в Telegram/дзвінком.'

function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function formatUAPhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('380')) digits = digits.slice(3)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  digits = digits.slice(0, 9)

  let out = '+380'
  if (digits.length > 0) out += ' ' + digits.slice(0, 2)
  if (digits.length > 2) out += ' ' + digits.slice(2, 5)
  if (digits.length > 5) out += ' ' + digits.slice(5, 7)
  if (digits.length > 7) out += ' ' + digits.slice(7, 9)
  return out
}

export function SubscriptionCheckoutModal({
  productId,
  productName,
  sizeLabel,
  frequencyLabel,
  deliveriesPerMonth,
  price,
  variantLabel,
  onClose,
}: SubscriptionCheckoutModalProps) {
  const minDate = tomorrowISO()

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('+380 ')
  const [street, setStreet] = useState('')
  const [building, setBuilding] = useState('')
  const [apartment, setApartment] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTimeWindow, setDeliveryTimeWindow] = useState('')
  const [comment, setComment] = useState('')
  const [wantsManagerContact, setWantsManagerContact] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pricePerBouquet = Math.round(price / deliveriesPerMonth)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const deliveryAddress = `вул. ${street.trim()}, буд. ${building.trim()}${apartment.trim() ? `, кв. ${apartment.trim()}` : ''}`
    const fullComment = wantsManagerContact
      ? [comment.trim(), MANAGER_CONTACT_NOTE].filter(Boolean).join('\n\n')
      : comment.trim() || undefined

    const result = await createOrder({
      customerName,
      phone,
      deliveryMethod: 'courier',
      deliveryCity: 'Київ',
      deliveryAddress,
      deliveryDate,
      deliveryTimeWindow,
      paymentMethod: 'online',
      comment: fullComment,
      items: [{ productId, variantLabel, quantity: 1 }],
    })

    if (!result.ok) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    const payment = await createPaymentInvoice(result.orderId)
    if (!payment.ok) {
      setError(payment.error)
      setSubmitting(false)
      return
    }

    window.location.href = payment.pageUrl
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Оформлення підписки</h2>
            <p className="mt-1 text-sm text-ink-soft">{productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="shrink-0 rounded-full p-1 text-ink-soft transition hover:bg-blush hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-blush/50 p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-ink-soft">Розмір</p>
            <p className="text-sm font-semibold text-ink">{sizeLabel}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft">Доставок / міс</p>
            <p className="text-sm font-semibold text-ink">{deliveriesPerMonth} букети</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft">Частота</p>
            <p className="text-sm font-semibold text-ink">{frequencyLabel}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft">Разом до сплати</p>
            <p className="text-sm font-semibold text-[#1E1E1E]">{formatUAH(price)}</p>
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-soft">{formatUAH(pricePerBouquet)} / букет</p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-ink-soft uppercase">Дата першої доставки</p>
            <input
              type="date"
              required
              min={minDate}
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              className="w-full rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-ink-soft uppercase">Час доставки</p>
            <div className="flex flex-wrap gap-2">
              {TIME_WINDOWS.map((window) => (
                <label key={window.value}>
                  <input
                    type="radio"
                    name="deliveryTimeWindow"
                    value={window.value}
                    required
                    checked={deliveryTimeWindow === window.value}
                    onChange={() => setDeliveryTimeWindow(window.value)}
                    className="peer sr-only"
                  />
                  <span className="block cursor-pointer rounded-full border border-ink/20 px-4 py-2 text-sm text-ink transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent hover:border-ink/50">
                    {window.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Контакти та адреса</p>
            <input
              type="text"
              required
              placeholder="Ім'я"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
            />
            <input
              type="tel"
              required
              placeholder="+380 XX XXX XX XX"
              value={phone}
              onChange={(event) => setPhone(formatUAPhone(event.target.value))}
              className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
            />
            <div className="flex items-center gap-2 rounded-full border border-ink/20 px-4 py-3 text-sm text-ink-soft">
              Київ
            </div>
            <input
              type="text"
              required
              placeholder="Вулиця"
              value={street}
              onChange={(event) => setStreet(event.target.value)}
              className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Будинок"
                value={building}
                onChange={(event) => setBuilding(event.target.value)}
                className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
              />
              <input
                type="text"
                placeholder="Квартира (необов'язково)"
                value={apartment}
                onChange={(event) => setApartment(event.target.value)}
                className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
              />
            </div>
            <textarea
              placeholder="Коментар флористу (необов'язково)"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-20 rounded-2xl border border-ink/20 px-4 py-3 text-sm text-ink"
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={wantsManagerContact}
              onChange={(event) => setWantsManagerContact(event.target.checked)}
              className="mt-0.5 accent-[#9EAF00]"
            />
            Хочу узгодити деталі з менеджером в Telegram/дзвінком
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full bg-[#9EAF00] px-6 py-3 text-sm font-bold text-[#1E1E1E] transition hover:bg-[#9EAF00]/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Надсилаємо…' : 'Перейти до оплати by mono'}
          </button>
        </form>
      </div>
    </div>
  )
}
