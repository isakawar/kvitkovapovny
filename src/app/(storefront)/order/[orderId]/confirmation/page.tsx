import { notFound } from 'next/navigation'
import Link from 'next/link'

import { getPayloadClient } from '@/lib/payload'
import { formatUAH } from '@/lib/money'
import { PurchaseTracker } from '@/components/storefront/PurchaseTracker'
import { RetryPaymentButton } from '@/components/storefront/RetryPaymentButton'

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

  const requiresOnlinePayment = order.paymentMethod === 'online' || order.paymentMethod === 'installments'
  const awaitingPayment = requiresOnlinePayment && order.paymentStatus === 'pending'
  const paymentPaid = requiresOnlinePayment && order.paymentStatus === 'paid'
  const paymentFailed = order.paymentStatus === 'failed'
  const orderNumber = `№ ${String(order.id).padStart(6, '0')}`

  const paymentBadge = paymentPaid
    ? { label: 'Оплату отримано', className: 'bg-green-50 text-green-700' }
    : awaitingPayment
      ? { label: 'Очікує оплати', className: 'bg-blush/60 text-ink' }
      : paymentFailed
        ? { label: 'Оплата не пройшла', className: 'bg-red-50 text-red-700' }
        : null

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <PurchaseTracker
        orderId={String(order.id)}
        initialPaymentStatus={order.paymentStatus ?? 'not_required'}
        requiresOnlinePayment={requiresOnlinePayment}
        value={(order.orderTotal ?? 0) / 100}
        items={order.items.map((item) => ({
          item_id: typeof item.product === 'object' ? String(item.product.id) : String(item.product),
          item_name: item.productName,
          item_variant: item.variantLabel ?? undefined,
          price: item.unitPrice / 100,
          quantity: item.quantity,
        }))}
      />
      <h1 className="mb-2 text-2xl font-semibold text-ink">Дякуємо за замовлення!</h1>

      <p className="mb-1 text-3xl font-semibold tracking-wide text-ink">{orderNumber}</p>
      {paymentBadge && (
        <p className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${paymentBadge.className}`}>
          {paymentBadge.label}
        </p>
      )}
      <p className="mb-4 text-sm text-ink-soft">
        Наш менеджер звʼяжеться з вами найближчим часом для підтвердження.
      </p>

      {awaitingPayment && (
        <p className="mb-4 rounded-xl bg-blush/50 px-4 py-3 text-sm text-ink">
          Очікуємо підтвердження оплати від Monobank. Це займає лічені секунди — статус оновиться автоматично.
        </p>
      )}
      {paymentFailed && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Оплата не пройшла. Спробуйте ще раз або звʼяжіться з нами.
        </p>
      )}
      {(awaitingPayment || paymentFailed) && <RetryPaymentButton orderId={String(order.id)} />}

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
