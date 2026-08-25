import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { verifyWebhookSignature, type MonobankWebhookPayload } from '@/lib/monobank'

// Monobank calls this URL (configured as `webHookUrl` on invoice/create) whenever
// an invoice's payment status changes. We must verify the `X-Sign` header before
// trusting the payload — otherwise anyone could POST a fake "success" and mark an
// order as paid for free. Always respond 200 once the body is read (even on an
// invalid signature) so Monobank doesn't retry forever; we simply don't act on
// unverified payloads.
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-sign')

  if (!signature || !(await verifyWebhookSignature(rawBody, signature))) {
    console.warn('Monobank webhook: invalid or missing signature — ignoring')
    return NextResponse.json({ ok: true })
  }

  let payload: MonobankWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: true })
  }

  const cms = await getPayloadClient()

  const result = await cms.find({
    collection: 'orders',
    where: { paymentReference: { equals: payload.invoiceId } },
    limit: 1,
  })
  const order = result.docs[0]
  if (!order) {
    console.warn(`Monobank webhook: no order found for invoiceId ${payload.invoiceId}`)
    return NextResponse.json({ ok: true })
  }

  if (payload.status === 'success') {
    await cms.update({
      collection: 'orders',
      id: order.id,
      data: { paymentStatus: 'paid', status: order.status === 'new' ? 'confirmed' : order.status },
    })
  } else if (payload.status === 'failure' || payload.status === 'expired') {
    await cms.update({ collection: 'orders', id: order.id, data: { paymentStatus: 'failed' } })
  }

  return NextResponse.json({ ok: true })
}
