import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const SubscriptionPricing: GlobalConfig = {
  slug: 'subscription-pricing',
  label: 'Фото розмірів підписки (калькулятор)',
  admin: {
    group: 'Головна сторінка',
    description:
      'Фотогалереї для розмірів у калькуляторі підписки на головній. Ціна, назва розміру (S/M/L/XXL) та бейдж "Хіт" беруться напряму з варіантів товару "Підписка на квіти" (розділ Каталог → Товари, позначений як "Виділений") — тут редагується лише поле label (для збігу з назвою варіанту) і фото.',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'sizes',
      type: 'array',
      label: 'Фотогалереї розмірів',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Має точно збігатися з назвою варіанту (S/M/L/XXL) у товарі "Підписка на квіти"',
          },
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
