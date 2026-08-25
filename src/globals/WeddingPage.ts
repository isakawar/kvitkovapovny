import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const WeddingPage: GlobalConfig = {
  slug: 'wedding-page',
  label: 'Весільна сторінка',
  admin: {
    group: 'Весілля',
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
      defaultValue: 'Квіткове оформлення весілля',
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      defaultValue:
        'Розробляємо індивідуальне квіткове оформлення під ваше весілля: арки, композиції на столи, букет нареченої, бутоньєрки. Кожен проєкт — окремий розрахунок під бюджет і стилістику свята.',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      type: 'array',
      admin: { description: 'Фото ваших весільних робіт — портфоліо' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'contactNote',
      type: 'text',
      defaultValue: 'Залиште заявку — зв\'яжемось для безкоштовної консультації протягом дня.',
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath('/wedding')
        } catch {
          // No-op outside a Next.js request context (e.g. seed scripts).
        }
        return doc
      },
    ],
  },
}
