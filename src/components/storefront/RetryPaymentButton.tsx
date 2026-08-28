'use client'

import { useState } from 'react'

import { createPaymentInvoice } from '@/app/actions/createPaymentInvoice'

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const result = await createPaymentInvoice(orderId)
    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }
    window.location.href = result.pageUrl
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? 'Створюємо рахунок…' : 'Спробувати оплатити ще раз'}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}
