import { notFound } from 'next/navigation'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { formatUAH } from '@/lib/money'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const payload = await getPayloadClient()

  let order
  try {
    order = await payload.findByID({ collection: 'orders', id: orderId })
  } catch {
    notFound()
  }
  if (!order) notFound()

  const awaitingPayment =
    (order.paymentMethod === 'online' || order.paymentMethod === 'installments') && order.paymentStatus === 'pending'
  const paymentFailed = order.paymentStatus === 'failed'

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-ink">Дякуємо за замовлення!</h1>
      <p className="mb-4 text-sm text-ink-soft">
        Номер замовлення: <span className="font-medium text-ink">#{String(order.id).slice(-6)}</span>
        <br />
        Наш менеджер звʼяжеться з вами найближчим часом для підтвердження.
      </p>

      {awaitingPayment && (
        <p className="mb-4 rounded-xl bg-blush/50 px-4 py-3 text-sm text-ink">
          Очікуємо підтвердження оплати від Monobank. Це займає лічені секунди — статус замовлення оновиться
          автоматично.
        </p>
      )}
      {paymentFailed && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Оплата не пройшла. Звʼяжіться з нами або спробуйте оформити замовлення ще раз.
        </p>
      )}

      <ul className="mb-6 space-y-2 text-left text-sm text-ink">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>
              {item.productName}
              {item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}
            </span>
            <span>{formatUAH(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mb-8 flex justify-between border-t border-ink/10 pt-4 text-base font-semibold text-ink">
        <span>Разом</span>
        <span>{formatUAH(order.orderTotal ?? 0)}</span>
      </div>

      <Link href="/" className="text-sm text-accent underline">
        На головну
      </Link>
    </div>
  )
}
