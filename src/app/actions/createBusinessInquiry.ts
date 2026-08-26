'use server'

import { getPayloadClient } from '@/lib/payload'

const BUSINESS_TYPES = ['restaurant', 'hotel', 'beauty', 'it_office', 'showroom', 'other'] as const
type BusinessType = (typeof BUSINESS_TYPES)[number]

export type CreateBusinessInquiryInput = {
  companyName: string
  contactPerson: string
  phone: string
  businessType: string
  budgetOrLocations?: string
}

export type CreateBusinessInquiryResult = { ok: true } | { ok: false; error: string }

function isBusinessType(value: string): value is BusinessType {
  return (BUSINESS_TYPES as readonly string[]).includes(value)
}

export async function createBusinessInquiry(
  input: CreateBusinessInquiryInput,
): Promise<CreateBusinessInquiryResult> {
  if (
    !input.companyName?.trim() ||
    !input.contactPerson?.trim() ||
    !input.phone?.trim() ||
    !isBusinessType(input.businessType)
  ) {
    return { ok: false, error: "Вкажіть назву компанії, контактну особу, телефон і тип бізнесу" }
  }

  const payload = await getPayloadClient()

  await payload.create({
    collection: 'business-inquiries',
    data: {
      companyName: input.companyName.trim(),
      contactPerson: input.contactPerson.trim(),
      phone: input.phone.trim(),
      businessType: input.businessType,
      budgetOrLocations: input.budgetOrLocations?.trim() || undefined,
      status: 'new',
    },
  })

  return { ok: true }
}
