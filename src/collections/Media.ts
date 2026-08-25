import type { CollectionConfig } from 'payload'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Каталог',
  },
  access: {
    read: () => true,
    create: isOwnerOrFlorist,
    update: isOwnerOrFlorist,
    delete: isOwnerOrFlorist,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 800 },
      { name: 'full', width: 1600 },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
