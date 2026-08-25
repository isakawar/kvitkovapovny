'use server'

import { getPayloadClient } from '@/lib/payload'

export type CreateOrderItemInput = {
  productId: string
  variantLabel?: string
  quantity: number
}

export type CreateOrderInput = {
  customerName: string
  phone: string
  email?: string
  deliveryCity: string
  deliveryAddress: string
  deliveryDate: string
  deliveryTimeWindow: string
  cardMessage?: string
  comment?: string
  items: CreateOrderItemInput[]
}

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; error: string }

const DELIVERY_TIME_WINDOWS = ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'] as const
type DeliveryTimeWindow = (typeof DELIVERY_TIME_WINDOWS)[number]

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!input.customerName?.trim() || !input.phone?.trim()) {
    return { ok: false, error: "Вкажіть ім'я та телефон" }
  }
  if (!input.deliveryCity?.trim() || !input.deliveryAddress?.trim() || !input.deliveryDate || !input.deliveryTimeWindow) {
    return { ok: false, error: 'Заповніть дані доставки' }
  }
  if (!DELIVERY_TIME_WINDOWS.includes(input.deliveryTimeWindow as DeliveryTimeWindow)) {
    return { ok: false, error: 'Невірний час доставки' }
  }
  const deliveryTimeWindow = input.deliveryTimeWindow as DeliveryTimeWindow
  if (!input.items?.length) {
    return { ok: false, error: 'Кошик порожній' }
  }

  const payload = await getPayloadClient()

  const resolvedItems: {
    product: number
    productName: string
    variantLabel?: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[] = []

  for (const item of input.items) {
    if (item.quantity < 1) continue

    const product = await payload.findByID({ collection: 'products', id: item.productId })
    if (!product || product._status !== 'published' || !product.inStock) continue

    const variant = item.variantLabel ? product.variants?.find((v) => v.label === item.variantLabel) : undefined
    const unitPrice = product.price + (variant?.priceModifier ?? 0)
    const lineTotal = unitPrice * item.quantity

    resolvedItems.push({
      product: product.id,
      productName: product.name,
      variantLabel: variant?.label,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    })
  }

  if (resolvedItems.length === 0) {
    return { ok: false, error: 'Товари в кошику більше недоступні' }
  }

  const order = await payload.create({
    collection: 'orders',
    data: {
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      deliveryCity: input.deliveryCity.trim(),
      deliveryAddress: input.deliveryAddress.trim(),
      deliveryDate: input.deliveryDate,
      deliveryTimeWindow,
      cardMessage: input.cardMessage?.trim() || undefined,
      comment: input.comment?.trim() || undefined,
      items: resolvedItems,
      status: 'new',
      paymentStatus: 'not_required',
      paymentProvider: 'none',
    },
  })

  return { ok: true, orderId: String(order.id) }
}
