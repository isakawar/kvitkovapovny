import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const SubscriptionPricing: GlobalConfig = {
  slug: 'subscription-pricing',
  label: 'Ціни підписки (калькулятор)',
  admin: {
    group: 'Контент сайту',
    description:
      'Ціни за розмірами для калькулятора підписки на головній. Ціна за 1 букет розраховується автоматично на сайті (ціна розміру / 4) — вводити її окремо не потрібно. Частота доставки на ціну не впливає, лише на графік.',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'sizes',
      type: 'array',
      label: 'Розміри підписки',
      minRows: 1,
      defaultValue: [
        { label: 'S', price: 500000, badge: '', active: true },
        { label: 'M', price: 680000, badge: 'Хіт', active: true },
        { label: 'L', price: 880000, badge: '', active: true },
        { label: 'XXL', price: 1280000, badge: '', active: true },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { description: 'Напр. S, M, L, XXL', width: '20%' } },
            {
              name: 'price',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                description: 'Базова ціна підписки цього розміру, в копійках (напр. 680000 = 6800.00 грн)',
                width: '35%',
              },
            },
            {
              name: 'badge',
              type: 'text',
              admin: { description: 'Напр. "Хіт", "Популярний" (необовʼязково)', width: '25%' },
            },
            {
              name: 'active',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Показувати цей розмір у калькуляторі', width: '20%' },
            },
          ],
        },
        {
          name: 'images',
          type: 'array',
          label: 'Фото для цього розміру',
          admin: {
            description:
              'Фото букета саме цього розміру для галереї в калькуляторі. Якщо порожньо — показуються загальні фото товару підписки.',
          },
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'alt', type: 'text' },
            {
              name: 'sortOrder',
              type: 'number',
              defaultValue: 0,
              admin: { description: 'Порядок показу — менше число показується раніше' },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath('/', 'layout')
        } catch {
          // No-op outside a Next.js request context (e.g. seed scripts).
        }
        return doc
      },
    ],
  },
}
