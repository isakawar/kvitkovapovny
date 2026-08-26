import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const Testimonials: GlobalConfig = {
  slug: 'testimonials',
  label: 'Відгуки клієнтів',
  admin: {
    group: 'Соціальний доказ',
    description: 'Скріншоти відгуків та рейтинг, що показуються в каруселі "Відгуки" на головній сторінці',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'googleRating',
          type: 'text',
          defaultValue: '5.0',
          admin: { description: 'Рейтинг для плашки "★ 5.0 на основі відгуків у Google" над каруселлю' },
        },
        {
          name: 'happySubscribersStat',
          type: 'text',
          defaultValue: '1000+ щасливих власників підписок',
          admin: { description: 'Текст поруч з рейтингом Google над каруселлю' },
        },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      admin: {
        description:
          'Скріншоти відгуків клієнтів (напр. з Instagram Stories/Highlights — завантаж скріншот сюди, Instagram не дає підтягувати їх автоматично)',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'authorName', type: 'text', admin: { description: "Ім'я клієнта (необовʼязково)" } },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath('/')
        } catch {
          // No-op outside a Next.js request context (e.g. seed scripts).
        }
        return doc
      },
    ],
  },
}
