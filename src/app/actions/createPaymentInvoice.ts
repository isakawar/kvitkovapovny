'use server'

import { getPayloadClient } from '@/lib/payload'
import { createInvoice } from '@/lib/monobank'

export type CreatePaymentInvoiceResult = { ok: true; pageUrl: string } | { ok: false; error: string }

export async function createPaymentInvoice(orderId: string): Promise<CreatePaymentInvoiceResult> {
  const payload = await getPayloadClient()

  let order
  try {
    order = await payload.findByID({ collection: 'orders', id: orderId })
  } catch {
    return { ok: false, error: 'Замовлення не знайдено' }
  }

  if (!order || (order.paymentMethod !== 'online' && order.paymentMethod !== 'installments')) {
    return { ok: false, error: 'Це замовлення не потребує онлайн-оплати' }
  }
  if (!order.orderTotal) {
    return { ok: false, error: 'Некоректна сума замовлення' }
  }

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''

  try {
    const invoice = await createInvoice({
      amount: order.orderTotal,
      reference: String(order.id),
      destination: `Замовлення #${String(order.id).slice(-6)} — Kvitkova Povnya`,
      redirectUrl: `${serverUrl}/order/${order.id}/confirmation`,
      webHookUrl: `${serverUrl}/integrations/monobank/webhook`,
    })

    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { paymentReference: invoice.invoiceId },
    })

    return { ok: true, pageUrl: invoice.pageUrl }
  } catch (error) {
    console.error('Failed to create Monobank invoice:', error)
    return { ok: false, error: 'Не вдалося створити рахунок для оплати. Спробуйте ще раз або оберіть інший спосіб оплати.' }
  }
}
