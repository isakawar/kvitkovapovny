import type { CollectionConfig } from 'payload'

import { isOwner } from '@/access/isOwner'
import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

const DELIVERY_TIME_WINDOWS = [
  { label: '09:00–12:00', value: '09:00-12:00' },
  { label: '10:00–14:00', value: '10:00-14:00' },
  { label: '12:00–15:00', value: '12:00-15:00' },
  { label: '14:00–18:00', value: '14:00-18:00' },
  { label: '15:00–18:00', value: '15:00-18:00' },
  { label: '18:00–21:00', value: '18:00-21:00' },
]

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    group: 'Замовлення',
    defaultColumns: ['customerName', 'phone', 'deliveryDate', 'status', 'orderTotal', 'createdAt'],
  },
  access: {
    // Checkout submits through the validated `createOrder` server action only — this
    // collection-level `create: true` is what lets that server action call payload.create().
    create: () => true,
    read: isOwnerOrFlorist,
    update: isOwnerOrFlorist,
    delete: isOwner,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'customerName', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
      ],
    },
    {
      name: 'email',
      type: 'text',
    },
    {
      name: 'isGift',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Замовлення на подарунок іншому отримувачу' },
    },
    {
      type: 'row',
      admin: { condition: (data) => Boolean(data.isGift) },
      fields: [
        { name: 'recipientName', type: 'text' },
        { name: 'recipientPhone', type: 'text' },
      ],
    },
    {
      name: 'giftSurprise',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Не розкривати деталі замовлення отримувачу (сюрприз)',
        condition: (data) => Boolean(data.isGift),
      },
    },
    {
      name: 'deliveryMethod',
      type: 'select',
      required: true,
      defaultValue: 'courier',
      options: [
        { label: "Кур'єрська доставка (Київ та область)", value: 'courier' },
        { label: 'Нова пошта (по Україні)', value: 'nova_poshta' },
        { label: 'Самовивіз з шоуруму', value: 'pickup' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'deliveryCity', type: 'text', admin: { description: "Кур'єр і Нова пошта" } },
        { name: 'deliveryDate', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
      ],
    },
    {
      name: 'deliveryAddress',
      type: 'textarea',
      admin: { description: "Кур'єрська доставка" },
    },
    {
      name: 'deliveryTimeWindow',
      type: 'select',
      options: DELIVERY_TIME_WINDOWS,
      admin: { description: "Кур'єрська доставка" },
    },
    {
      type: 'row',
      fields: [
        { name: 'npOfficeNumber', type: 'text', admin: { description: 'Номер відділення/поштомату' } },
        { name: 'npCityRef', type: 'text', admin: { description: 'Ref міста в довіднику Нової пошти', readOnly: true } },
        { name: 'npWarehouseRef', type: 'text', admin: { description: 'Ref відділення в довіднику Нової пошти', readOnly: true } },
      ],
    },
    {
      name: 'pickupTime',
      type: 'text',
      admin: { description: 'Самовивіз — орієнтовний час візиту' },
    },
    {
      name: 'cardMessage',
      type: 'textarea',
      admin: { description: 'Текст листівки' },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'online',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Онлайн-оплата (Картка / Apple Pay / Google Pay через Monobank)', value: 'online' },
        { label: 'Оплата частинами Monobank', value: 'installments' },
        { label: 'Оплата за рахунком для бізнесу (ФОП / ТОВ)', value: 'business_invoice' },
      ],
    },
    {
      name: 'comment',
      type: 'textarea',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'productName', type: 'text', required: true },
        { name: 'variantLabel', type: 'text' },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'unitPrice', type: 'number', required: true, admin: { description: 'Копійки' } },
        { name: 'lineTotal', type: 'number', required: true, admin: { description: 'Копійки' } },
      ],
    },
    {
      name: 'orderTotal',
      type: 'number',
      admin: { description: 'Копійки, рахується автоматично', readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Нове', value: 'new' },
        { label: 'Підтверджено', value: 'confirmed' },
        { label: 'У роботі', value: 'in_progress' },
        { label: 'Виконано', value: 'done' },
        { label: 'Скасовано', value: 'cancelled' },
      ],
    },
    // Payment placeholders — not wired to any gateway yet. Monobank Acquiring / Monobank
    // installments integration will populate these later without a schema change.
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'not_required',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Не потрібна', value: 'not_required' },
        { label: 'Очікується', value: 'pending' },
        { label: 'Оплачено', value: 'paid' },
        { label: 'Не вдалась', value: 'failed' },
        { label: 'Повернення', value: 'refunded' },
      ],
    },
    {
      name: 'paymentProvider',
      type: 'select',
      defaultValue: 'none',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Немає', value: 'none' },
        { label: 'Monobank Acquiring', value: 'monobank_acquiring' },
        { label: 'Оплата частинами Monobank', value: 'monobank_installments' },
      ],
    },
    {
      name: 'paymentReference',
      type: 'text',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (Array.isArray(data.items)) {
          data.orderTotal = data.items.reduce(
            (sum: number, item: { lineTotal?: number }) => sum + (item.lineTotal || 0),
            0,
          )
        }
        return data
      },
    ],
    afterChange: [
      // Extension point for the client's CRM integration: POST the created order to
      // process.env.CRM_WEBHOOK_URL when operation === 'create'. Intentionally left as a
      // documented no-op until that integration is scoped (see docs/future-integrations.md).
    ],
  },
}
