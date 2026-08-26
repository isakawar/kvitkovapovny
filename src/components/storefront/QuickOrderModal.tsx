'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createOrder } from '@/app/actions/createOrder'
import { formatUAH } from '@/lib/money'

type QuickOrderModalProps = {
  productId: string
  productName: string
  unitPrice: number
  onClose: () => void
}

export function QuickOrderModal({ productId, productName, unitPrice, onClose }: QuickOrderModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const today = new Date().toISOString().slice(0, 10)
    const result = await createOrder({
      customerName,
      phone,
      deliveryMethod: 'pickup',
      deliveryDate: today,
      pickupTime: 'Уточнити з менеджером',
      paymentMethod: 'business_invoice',
      comment: 'Швидке замовлення з картки товару — зв\'язатися для деталей доставки',
      items: [{ productId, quantity: 1 }],
    })

    if (!result.ok) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    router.push(`/order/${result.orderId}/confirmation`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-ink">Швидке замовлення</h2>
        <p className="mt-1 text-sm text-ink-soft">{productName}</p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            required
            placeholder="Ваше ім'я"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
          />
          <input
            type="tel"
            required
            placeholder="Телефон"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Надсилаємо…' : `Замовити за ${formatUAH(unitPrice)}`}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-ink-soft underline">
            Скасувати
          </button>
        </form>
      </div>
    </div>
  )
}
