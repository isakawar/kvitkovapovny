'use client'

import { useState } from 'react'

import { createWeddingInquiry } from '@/app/actions/createWeddingInquiry'
import { track } from '@/lib/analytics'

export function WeddingInquiryForm({
  formHeading,
  contactNote,
}: {
  formHeading?: string | null
  contactNote?: string | null
}) {
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
      weddingDate: String(formData.get('weddingDate') || '') || undefined,
      comment: String(formData.get('comment') || '') || undefined,
    })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    track('submit_lead_form', { form_type: 'wedding' })
    setDone(true)
  }

  if (done) {
    return (
      <div id="wedding-form" className="rounded-2xl bg-white p-8 text-center">
        <p className="text-lg font-medium text-ink">Дякуємо за заявку!</p>
        {contactNote && <p className="mt-2 text-sm text-ink-soft">{contactNote}</p>}
      </div>
    )
  }

  return (
    <form id="wedding-form" onSubmit={handleSubmit} className="grid scroll-mt-24 gap-4 rounded-2xl bg-white p-8">
      <h3 className="text-lg font-medium text-ink">{formHeading || 'Плануєте весілля? Давайте зафіксуємо дату'}</h3>
      {contactNote && <p className="text-sm text-ink-soft">{contactNote}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="customerName" required placeholder="Імена молодят" className="input" />
        <input name="weddingDate" type="date" placeholder="Дата весілля" className="input" />
        <input name="phone" type="tel" required placeholder="+380" className="input" />
      </div>
      <textarea
        name="comment"
        placeholder="Кількість гостей / побажання"
        className="input min-h-24"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:bg-accent-hover disabled:opacity-60"
      >
        {submitting ? 'Надсилаємо…' : 'Створити весільну підписку'}
      </button>
    </form>
  )
}
