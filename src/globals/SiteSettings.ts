import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Налаштування сайту',
  admin: {
    group: 'Налаштування',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'designTheme',
      type: 'select',
      label: 'Дизайн сайту',
      defaultValue: 'old',
      options: [
        { label: 'Старий дизайн', value: 'old' },
        { label: 'Новий дизайн (ребрендінг)', value: 'new' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Перемикає весь сайт між старою та новою фірмовою темою',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Лого в шапці сайту (замінює текстовий напис "kvitkova povnya")' },
    },
    {
      type: 'row',
      fields: [
        { name: 'contactPhone', type: 'text' },
        { name: 'contactEmail', type: 'text' },
      ],
    },
    {
      name: 'instagramUrl',
      type: 'text',
    },
    {
      name: 'telegramUrl',
      type: 'text',
      admin: { description: 'Посилання на Telegram (канал або чат для звʼязку) — використовується у футері' },
    },
    {
      name: 'showroomAddress',
      type: 'text',
      admin: { description: 'Адреса шоуруму/студії для самовивозу — показується на сторінці чекауту' },
    },
    {
      name: 'deliveryCities',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'active', type: 'checkbox', defaultValue: true },
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
