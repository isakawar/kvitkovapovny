import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Головний банер',
  admin: {
    group: 'Головна сторінка',
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
      defaultValue: 'СВІЖІ КВІТИ У ВАШОМУ ДОМІ ЩОТИЖНЯ',
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: 'Спеціальна ваза та флористичний секатор у подарунок до першої підписки',
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
      defaultValue: [{ label: 'ОБРАТИ СВІЙ ТАРИФ', href: '/katalog', style: 'primary' }],
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
