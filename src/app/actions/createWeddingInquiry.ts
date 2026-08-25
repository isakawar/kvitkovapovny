'use server'

import { getPayloadClient } from '@/lib/payload'

export type CreateWeddingInquiryInput = {
  customerName: string
  phone: string
  email?: string
  weddingDate?: string
  guestsCount?: number
  budget?: string
  comment?: string
}

export type CreateWeddingInquiryResult = { ok: true } | { ok: false; error: string }

export async function createWeddingInquiry(input: CreateWeddingInquiryInput): Promise<CreateWeddingInquiryResult> {
  if (!input.customerName?.trim() || !input.phone?.trim()) {
    return { ok: false, error: "Вкажіть ім'я та телефон" }
  }

  const payload = await getPayloadClient()

  await payload.create({
    collection: 'wedding-inquiries',
    data: {
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      weddingDate: input.weddingDate || undefined,
      guestsCount: input.guestsCount || undefined,
      budget: input.budget?.trim() || undefined,
      comment: input.comment?.trim() || undefined,
      status: 'new',
    },
  })

  return { ok: true }
}
