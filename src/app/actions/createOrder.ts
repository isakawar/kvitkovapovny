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
  isGift?: boolean
  recipientName?: string
  recipientPhone?: string
  giftSurprise?: boolean
  deliveryMethod: string
  deliveryCity?: string
  deliveryAddress?: string
  deliveryDate: string
  deliveryTimeWindow?: string
  npOfficeNumber?: string
  pickupTime?: string
  cardMessage?: string
  comment?: string
  paymentMethod: string
  items: CreateOrderItemInput[]
}

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; error: string }

const DELIVERY_TIME_WINDOWS = ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'] as const
type DeliveryTimeWindow = (typeof DELIVERY_TIME_WINDOWS)[number]

const DELIVERY_METHODS = ['courier', 'nova_poshta', 'pickup'] as const
type DeliveryMethod = (typeof DELIVERY_METHODS)[number]

const PAYMENT_METHODS = ['online', 'business_invoice', 'manager_confirm'] as const
type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!input.customerName?.trim() || !input.phone?.trim()) {
    return { ok: false, error: "Вкажіть ім'я та телефон" }
  }
  if (!DELIVERY_METHODS.includes(input.deliveryMethod as DeliveryMethod)) {
    return { ok: false, error: 'Оберіть спосіб доставки' }
  }
  const deliveryMethod = input.deliveryMethod as DeliveryMethod

  if (!input.deliveryDate) {
    return { ok: false, error: 'Вкажіть дату доставки' }
  }

  let deliveryTimeWindow: DeliveryTimeWindow | undefined
  if (deliveryMethod === 'courier') {
    if (!input.deliveryCity?.trim() || !input.deliveryAddress?.trim() || !input.deliveryTimeWindow) {
      return { ok: false, error: 'Заповніть місто, адресу та час доставки' }
    }
    if (!DELIVERY_TIME_WINDOWS.includes(input.deliveryTimeWindow as DeliveryTimeWindow)) {
      return { ok: false, error: 'Невірний час доставки' }
    }
    deliveryTimeWindow = input.deliveryTimeWindow as DeliveryTimeWindow
  } else if (deliveryMethod === 'nova_poshta') {
    if (!input.deliveryCity?.trim() || !input.npOfficeNumber?.trim()) {
      return { ok: false, error: 'Вкажіть місто та номер відділення Нової пошти' }
    }
  } else if (deliveryMethod === 'pickup' && !input.pickupTime?.trim()) {
    return { ok: false, error: 'Вкажіть орієнтовний час візиту' }
  }

  if (input.isGift && deliveryMethod !== 'pickup' && (!input.recipientName?.trim() || !input.recipientPhone?.trim())) {
    return { ok: false, error: "Вкажіть ім'я та телефон отримувача подарунка" }
  }
  if (!PAYMENT_METHODS.includes(input.paymentMethod as PaymentMethod)) {
    return { ok: false, error: 'Оберіть спосіб оплати' }
  }
  const paymentMethod = input.paymentMethod as PaymentMethod
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

  const isGift = Boolean(input.isGift) && deliveryMethod !== 'pickup'

  const order = await payload.create({
    collection: 'orders',
    data: {
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      isGift,
      recipientName: isGift ? input.recipientName?.trim() || undefined : undefined,
      recipientPhone: isGift ? input.recipientPhone?.trim() || undefined : undefined,
      giftSurprise: isGift ? (input.giftSurprise ?? false) : false,
      deliveryMethod,
      deliveryCity: deliveryMethod !== 'pickup' ? input.deliveryCity?.trim() || undefined : undefined,
      deliveryAddress: deliveryMethod === 'courier' ? input.deliveryAddress?.trim() || undefined : undefined,
      deliveryDate: input.deliveryDate,
      deliveryTimeWindow,
      npOfficeNumber: deliveryMethod === 'nova_poshta' ? input.npOfficeNumber?.trim() || undefined : undefined,
      pickupTime: deliveryMethod === 'pickup' ? input.pickupTime?.trim() || undefined : undefined,
      cardMessage: input.cardMessage?.trim() || undefined,
      comment: input.comment?.trim() || undefined,
      paymentMethod,
      items: resolvedItems,
      status: 'new',
      paymentStatus: 'not_required',
      paymentProvider: 'none',
    },
  })

  return { ok: true, orderId: String(order.id) }
}
