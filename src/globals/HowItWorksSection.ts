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

export const HowItWorksSection: GlobalConfig = {
  slug: 'how-it-works-section',
  label: 'Блок "Як це працює"',
  admin: {
    group: 'Контент сайту',
    description: 'Заголовок і пронумеровані кроки (лише в новому дизайні)',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Як це працює',
    },
    {
      name: 'steps',
      type: 'array',
      minRows: 1,
      maxRows: 5,
      defaultValue: [
        { icon: 'flower', title: 'Обираєте тариф', subtitle: 'Розмір букета, частота та день доставки' },
        { icon: 'vase', title: 'Отримуєте подарунки', subtitle: 'Ваза, секатор, інструкція по догляду' },
        { icon: 'sparkle', title: 'Насолоджуєтесь', subtitle: 'Свіжі квіти у вашому домі щотижня' },
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
