import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

const iconOptions = [
  { label: 'Доставка', value: 'truck' },
  { label: 'Ваза', value: 'vase' },
  { label: 'Пауза', value: 'pause' },
  { label: 'Квітка', value: 'flower' },
  { label: 'Дім', value: 'home' },
  { label: 'Зірка', value: 'sparkle' },
]

export const FeatureStrip: GlobalConfig = {
  slug: 'feature-strip',
  label: 'Стрічка переваг',
  admin: {
    group: 'Контент сайту',
    description: 'Ряд із 3 переваг з іконками під головним банером (лише в новому дизайні)',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      defaultValue: [
        { icon: 'truck', title: 'Безкоштовна доставка по Києву' },
        { icon: 'vase', title: 'Ваза та секатор у подарунок' },
        { icon: 'pause', title: 'Можливість паузи підписки' },
      ],
      fields: [
        { name: 'icon', type: 'select', required: true, options: iconOptions },
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text' },
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
