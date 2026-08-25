import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Головний банер',
  admin: {
    group: 'Контент сайту',
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
      defaultValue: 'ПІДПИСКА НА КВІТИ',
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: 'квіти не тільки на свята',
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: { contains: 'video' },
      },
    },
    {
      name: 'fallbackImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Постер відео та резервне зображення для мобільних',
      },
    },
    {
      name: 'ctaButtons',
      type: 'array',
      maxRows: 3,
      defaultValue: [{ label: 'Переглянути', href: '/katalog', style: 'primary' }],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Основна', value: 'primary' },
            { label: 'Другорядна', value: 'secondary' },
          ],
        },
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
