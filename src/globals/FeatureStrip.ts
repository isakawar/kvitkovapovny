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
      name: 'heading',
      type: 'text',
      defaultValue: 'Квіткові підписки та доставка по Києву',
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      defaultValue: [
        {
          icon: 'truck',
          title: 'Безкоштовна доставка по Києву',
          description: 'Кожна підписка доїжджає безкоштовно в межах Києва — свіжі квіти без додаткових витрат.',
        },
        {
          icon: 'vase',
          title: 'Ваза та секатор у подарунок',
          description: 'До першої доставки додаємо вазу та флористичний секатор, щоб букет одразу почував себе вдома.',
        },
        {
          icon: 'pause',
          title: 'Пауза та зміна дати в 1 клік',
          description: 'Керуйте підпискою онлайн: змінюйте дату, пропускайте доставку або ставте на паузу в будь-який момент.',
        },
      ],
      fields: [
        { name: 'icon', type: 'select', required: true, options: iconOptions },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'ОБРАТИ ПЛАН ПІДПИСКИ' },
        { name: 'href', type: 'text', defaultValue: '/katalog' },
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
