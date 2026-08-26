'use client'

import { useState } from 'react'

import { createBusinessInquiry } from '@/app/actions/createBusinessInquiry'

const businessTypeOptions = [
  { label: 'Ресторан', value: 'restaurant' },
  { label: 'Готель', value: 'hotel' },
  { label: "Б'юті-салон", value: 'beauty' },
  { label: 'IT-офіс', value: 'it_office' },
  { label: 'Шоурум', value: 'showroom' },
  { label: 'Інше', value: 'other' },
]

export function BusinessInquiryForm() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createBusinessInquiry({
      companyName: String(formData.get('companyName') || ''),
      contactPerson: String(formData.get('contactPerson') || ''),
      phone: String(formData.get('phone') || ''),
      businessType: String(formData.get('businessType') || ''),
      budgetOrLocations: String(formData.get('budgetOrLocations') || '') || undefined,
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
      <div id="business-form" className="rounded-2xl bg-white p-8 text-center">
        <p className="text-lg font-medium text-ink">Дякуємо за заявку!</p>
        <p className="mt-2 text-sm text-ink-soft">Зв&apos;яжемось для узгодження тестового тижня протягом дня.</p>
      </div>
    )
  }

  return (
    <form id="business-form" onSubmit={handleSubmit} className="grid scroll-mt-24 gap-4 rounded-2xl bg-white p-8">
      <h3 className="text-lg font-medium text-ink">Запит B2B-співпраці</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="companyName" required placeholder="Назва компанії" className="input" />
        <input name="contactPerson" required placeholder="Контактна особа" className="input" />
        <input name="phone" type="tel" required placeholder="+380" className="input" />
        <select name="businessType" required defaultValue="" className="input">
          <option value="" disabled>
            Тип бізнесу
          </option>
          {businessTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <input name="budgetOrLocations" placeholder="Орієнтовний бюджет / кількість локацій" className="input" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:bg-accent-hover disabled:opacity-60"
      >
        {submitting ? 'Надсилаємо…' : 'Замовити тестовий тиждень'}
      </button>
    </form>
  )
}
