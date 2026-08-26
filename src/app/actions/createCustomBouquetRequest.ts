'use server'

import { getPayloadClient } from '@/lib/payload'

const GAMMA_OPTIONS = ['gentle', 'bright', 'classic', 'florist_choice'] as const
type Gamma = (typeof GAMMA_OPTIONS)[number]

export type CreateCustomBouquetRequestResult = { ok: true } | { ok: false; error: string }

export async function createCustomBouquetRequest(
  formData: FormData,
): Promise<CreateCustomBouquetRequestResult> {
  const customerName = String(formData.get('customerName') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const gamma = String(formData.get('gamma') || '')
  const budgetRaw = String(formData.get('budget') || '')
  const occasion = String(formData.get('occasion') || '').trim()
  const likedFlowers = String(formData.get('likedFlowers') || '').trim()
  const dislikedFlowers = String(formData.get('dislikedFlowers') || '').trim()
  const cardMessage = String(formData.get('cardMessage') || '').trim()
  const photo = formData.get('referencePhoto')

  if (!customerName || !phone) {
    return { ok: false, error: "Вкажіть ім'я та телефон" }
  }
  if (!GAMMA_OPTIONS.includes(gamma as Gamma)) {
    return { ok: false, error: 'Оберіть гаму букета' }
  }
  const budget = Number(budgetRaw)
  if (!Number.isFinite(budget) || budget <= 0) {
    return { ok: false, error: 'Вкажіть бюджет' }
  }

  const payload = await getPayloadClient()

  let referencePhotoId: number | undefined
  if (photo instanceof File && photo.size > 0) {
    const buffer = Buffer.from(await photo.arrayBuffer())
    const media = await payload.create({
      collection: 'media',
      data: { alt: `Референс до заявки "Збери букет сам" — ${customerName}` },
      file: {
        data: buffer,
        mimetype: photo.type,
        name: photo.name,
        size: photo.size,
      },
    })
    referencePhotoId = media.id
  }

  await payload.create({
    collection: 'custom-bouquet-requests',
    data: {
      customerName,
      phone,
      gamma: gamma as Gamma,
      budget: Math.round(budget * 100),
      occasion: occasion || undefined,
      likedFlowers: likedFlowers || undefined,
      dislikedFlowers: dislikedFlowers || undefined,
      cardMessage: cardMessage || undefined,
      referencePhoto: referencePhotoId,
      status: 'new',
    },
  })

  return { ok: true }
}
