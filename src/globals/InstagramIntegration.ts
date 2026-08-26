import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const InstagramIntegration: GlobalConfig = {
  slug: 'instagram-integration',
  label: 'Instagram',
  admin: {
    group: 'Соціальний доказ',
    description:
      'Налаштування підключення до Instagram Graph API та ручний список дописів. Поки accessToken не заповнений, на сайті показується ручний список нижче.',
  },
  // Read access is intentionally restricted (not `() => true`) — accessToken must
  // never be exposed via the public REST/GraphQL API. Server components still get
  // full access through the Payload Local API, which defaults to overrideAccess: true.
  access: {
    read: isOwnerOrFlorist,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'accessToken',
      type: 'text',
      admin: {
        description:
          'Довгостроковий Page Access Token з дозволами instagram_basic, pages_show_list, pages_read_engagement (Meta Graph API Explorer → Access Token Debugger → Extend Access Token).',
      },
    },
    {
      name: 'igUserId',
      type: 'text',
      admin: {
        description:
          'Instagram Business Account ID. Отримується через GET /me/accounts, поле instagram_business_account для потрібної сторінки.',
      },
    },
    {
      name: 'postLimit',
      type: 'number',
      defaultValue: 12,
      admin: {
        description: 'Скільки останніх дописів підтягувати для стрічки на головній сторінці',
      },
    },
    {
      name: 'instagramPosts',
      type: 'array',
      label: 'Ручний список дописів',
      admin: {
        description:
          'Показується на сайті, поки не заповнені accessToken та igUserId вище (автопідключення до Graph API)',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'link', type: 'text', admin: { description: 'Посилання на пост (необовʼязково)' } },
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
