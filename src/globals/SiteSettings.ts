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
      name: 'tiktokUrl',
      type: 'text',
      defaultValue: 'https://www.tiktok.com/@kvitkovapovnya',
      admin: { description: 'Посилання на TikTok — використовується у футері' },
    },
    {
      name: 'threadsUrl',
      type: 'text',
      defaultValue: 'https://www.threads.com/@kvitkova.povnya',
      admin: { description: 'Посилання на Threads — використовується у футері' },
    },
    {
      name: 'showroomAddress',
      type: 'text',
      admin: { description: 'Адреса шоуруму/студії для самовивозу — показується на сторінці чекауту' },
    },
    {
      name: 'googleMapsUrl',
      type: 'text',
      defaultValue: 'https://maps.app.goo.gl/FDsoVNhec2FLPu4H6',
      admin: {
        description: 'Посилання Google Maps на шоурум — адреса у футері та на сторінці контактів веде сюди',
      },
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
