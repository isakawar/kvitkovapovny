'use client'

import { useRef, useState } from 'react'

import { createCustomBouquetRequest } from '@/app/actions/createCustomBouquetRequest'
import { formatUAH } from '@/lib/money'

type Gamma = 'gentle' | 'bright' | 'classic' | 'florist_choice'

const GAMMA_OPTIONS: { value: Gamma; label: string; swatch: string }[] = [
  { value: 'gentle', label: 'Ніжна', swatch: 'linear-gradient(135deg, #f7d9e3, #fbeee3)' },
  { value: 'bright', label: 'Яскрава', swatch: 'linear-gradient(135deg, #ff6b6b, #ffd93d)' },
  { value: 'classic', label: 'Біла / Класична', swatch: 'linear-gradient(135deg, #ffffff, #e8e2d8)' },
  { value: 'florist_choice', label: 'На розсуд флориста', swatch: 'linear-gradient(135deg, #9eaf00, #cfe08a)' },
]

const BUDGET_OPTIONS = [1500, 2500, 3500]

const STEP_LABELS = ['Гама', 'Бюджет', 'Побажання', 'Підсумок']

export function CustomBouquetWizard() {
  const [step, setStep] = useState(0)
  const [gamma, setGamma] = useState<Gamma | null>(null)
  const [budget, setBudget] = useState<number | null>(null)
  const [customBudget, setCustomBudget] = useState('')
  const [occasion, setOccasion] = useState('')
  const [likedFlowers, setLikedFlowers] = useState('')
  const [dislikedFlowers, setDislikedFlowers] = useState('')
  const [cardMessage, setCardMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const effectiveBudget = budget ?? (customBudget ? Number(customBudget) : null)
  const gammaLabel = GAMMA_OPTIONS.find((g) => g.value === gamma)?.label

  function canProceed() {
    if (step === 0) return gamma !== null
    if (step === 1) return effectiveBudget !== null && effectiveBudget > 0
    return true
  }

  async function handleSubmit() {
    if (!gamma || !effectiveBudget) return
    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set('customerName', customerName)
    formData.set('phone', phone)
    formData.set('gamma', gamma)
    formData.set('budget', String(effectiveBudget))
    formData.set('occasion', occasion)
    formData.set('likedFlowers', likedFlowers)
    formData.set('dislikedFlowers', dislikedFlowers)
    formData.set('cardMessage', cardMessage)
    if (photo) formData.set('referencePhoto', photo)

    const result = await createCustomBouquetRequest(formData)
    if (!result.ok) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Дякуємо!</h1>
        <p className="mt-3 text-ink-soft">
          Ваша заявка прийнята. Флорист звʼяжеться з вами за телефоном {phone} найближчим часом, щоб узгодити деталі.
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-center text-2xl font-semibold tracking-wide text-ink uppercase">Збери букет сам</h1>

      <div className="mt-8 flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                index === step
                  ? 'bg-ink text-cream'
                  : index < step
                    ? 'bg-accent text-on-accent'
                    : 'bg-blush text-ink-soft'
              }`}
            >
              {index + 1}
            </div>
            {index < STEP_LABELS.length - 1 && <div className="h-px w-6 bg-ink/20" />}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-sm text-ink-soft">{STEP_LABELS[step]}</p>

      <div className="mt-8 flex flex-col gap-6">
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {GAMMA_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGamma(option.value)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                  gamma === option.value ? 'border-ink ring-2 ring-ink' : 'border-ink/20 hover:border-ink/50'
                }`}
              >
                <span className="h-16 w-full rounded-xl" style={{ background: option.swatch }} />
                <span className="text-sm font-medium text-ink">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setBudget(amount)
                    setCustomBudget('')
                  }}
                  className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                    budget === amount ? 'border-ink bg-ink text-cream' : 'border-ink/20 text-ink hover:border-ink/50'
                  }`}
                >
                  {amount.toLocaleString('uk-UA')} грн
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Своя сума (грн)
              <input
                type="number"
                min={100}
                value={customBudget}
                onChange={(event) => {
                  setCustomBudget(event.target.value)
                  setBudget(null)
                }}
                placeholder="Наприклад, 4000"
                className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Привід (необовʼязково)
              <input
                type="text"
                value={occasion}
                onChange={(event) => setOccasion(event.target.value)}
                placeholder="День народження, річниця…"
                className="rounded-full border border-ink/20 px-4 py-3 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Улюблені / небажані квіти
              <textarea
                value={likedFlowers}
                onChange={(event) => setLikedFlowers(event.target.value)}
                rows={3}
                placeholder="Напр. люблю півонії, не люблю хризантеми"
                className="rounded-2xl border border-ink/20 px-4 py-3 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Текст листівки (необовʼязково)
              <textarea
                value={cardMessage}
                onChange={(event) => setCardMessage(event.target.value)}
                rows={2}
                className="rounded-2xl border border-ink/20 px-4 py-3 text-sm text-ink"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-2xl bg-blush/50 p-4 text-sm text-ink">
              <p>
                <span className="font-semibold">Гама:</span> {gammaLabel}
              </p>
              <p>
                <span className="font-semibold">Бюджет:</span> {effectiveBudget ? formatUAH(effectiveBudget * 100) : '—'}
              </p>
              {occasion && (
                <p>
                  <span className="font-semibold">Привід:</span> {occasion}
                </p>
              )}
              {likedFlowers && (
                <p>
                  <span className="font-semibold">Побажання щодо квітів:</span> {likedFlowers}
                </p>
              )}
              {cardMessage && (
                <p>
                  <span className="font-semibold">Листівка:</span> {cardMessage}
                </p>
              )}
            </div>

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

            <label className="flex flex-col gap-1 text-sm text-ink">
              Фото-приклад (необовʼязково)
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
                className="text-sm text-ink-soft"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full border border-ink/20 px-6 py-3 text-sm text-ink transition hover:border-ink/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Назад
        </button>

        {step < STEP_LABELS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Далі
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !customerName.trim() || !phone.trim()}
            className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Надсилаємо…' : 'Надіслати заявку'}
          </button>
        )}
      </div>
    </section>
  )
}
