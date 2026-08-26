import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Налаштування сайту',
  admin: {
    group: 'Контент сайту',
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
      name: 'instagramPosts',
      type: 'array',
      admin: { description: 'Фото з Instagram для стрічки на головній сторінці' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'link', type: 'text', admin: { description: 'Посилання на пост (необовʼязково)' } },
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
    {
      name: 'googleRating',
      type: 'text',
      defaultValue: '5.0',
      admin: { description: 'Рейтинг для плашки "★ 5.0 на основі відгуків у Google" над каруселлю відгуків' },
    },
    {
      name: 'happySubscribersStat',
      type: 'text',
      defaultValue: '1000+ щасливих власників підписок',
      admin: { description: 'Текст поруч з рейтингом Google над каруселлю відгуків' },
    },
    {
      name: 'deliveryCities',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'active', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'faqItems',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
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
