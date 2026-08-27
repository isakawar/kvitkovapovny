'use server'

import { getPayloadClient } from '@/lib/payload'

export async function getOrderPaymentStatus(orderId: string): Promise<{ paymentStatus: string } | null> {
  const payload = await getPayloadClient()

  try {
    const order = await payload.findByID({ collection: 'orders', id: orderId, overrideAccess: true, depth: 0 })
    return { paymentStatus: order.paymentStatus ?? 'not_required' }
  } catch {
    return null
  }
}
