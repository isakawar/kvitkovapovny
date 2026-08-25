'use client'

import { useState } from 'react'

import { createWeddingInquiry } from '@/app/actions/createWeddingInquiry'

export function WeddingInquiryForm({ contactNote }: { contactNote?: string | null }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createWeddingInquiry({
      customerName: String(formData.get('customerName') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || '') || undefined,
      weddingDate: String(formData.get('weddingDate') || '') || undefined,
      guestsCount: formData.get('guestsCount') ? Number(formData.get('guestsCount')) : undefined,
      budget: String(formData.get('budget') || '') || undefined,
      comment: String(formData.get('comment') || '') || undefined,
    })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        <p className="text-lg font-medium text-ink">Дякуємо за заявку!</p>
        {contactNote && <p className="mt-2 text-sm text-ink-soft">{contactNote}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl bg-white p-8">
      <h3 className="text-lg font-medium text-ink">Заявка на консультацію</h3>
      {contactNote && <p className="text-sm text-ink-soft">{contactNote}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="customerName" required placeholder="Ім'я та прізвище" className="input" />
        <input name="phone" required placeholder="Телефон" className="input" />
        <input name="email" type="email" placeholder="Email (необов'язково)" className="input" />
        <input name="weddingDate" type="date" placeholder="Дата весілля" className="input" />
        <input name="guestsCount" type="number" min="1" placeholder="Кількість гостей" className="input" />
        <input name="budget" placeholder="Орієнтовний бюджет" className="input" />
      </div>
      <textarea name="comment" placeholder="Розкажіть про ваше весілля: стиль, локація, побажання" className="input min-h-24" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink/80 disabled:opacity-60"
      >
        {submitting ? 'Надсилаємо…' : 'Надіслати заявку'}
      </button>
    </form>
  )
}
