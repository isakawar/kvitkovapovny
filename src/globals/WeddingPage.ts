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
      defaultValue: 'Квіти, які не зав\'януть після весілля',
    },
    {
      name: 'subheading',
      type: 'textarea',
      defaultValue:
        'Створіть весільний фонд квітів разом із гостями та отримуйте свіжі букети щотижня протягом року.',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Залишити заявку',
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      defaultValue:
        'Розробляємо індивідуальне квіткове оформлення під ваше весілля: арки, композиції на столи, букет нареченої, бутоньєрки. Кожен проєкт — окремий розрахунок під бюджет і стилістику свята.',
    },
    {
      name: 'steps',
      type: 'array',
      minRows: 1,
      maxRows: 5,
      admin: { description: 'Блок "Як це працює"' },
      defaultValue: [
        {
          icon: 'sparkle',
          title: 'Реєстрація весілля',
          subtitle: 'Ми створюємо банку Monobank та онлайн-картку з QR для гостей',
        },
        {
          icon: 'flower',
          title: 'Гості донатять на квіти',
          subtitle: 'Гості закидають суму на букет і залишають привітання',
        },
        {
          icon: 'home',
          title: 'Рік краси у вашому домі',
          subtitle: 'Щотижня ви отримуєте букет із теплими словами від гостя',
        },
      ],
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: [
            { label: 'Доставка', value: 'truck' },
            { label: 'Ваза', value: 'vase' },
            { label: 'Пауза', value: 'pause' },
            { label: 'Квітка', value: 'flower' },
            { label: 'Дім', value: 'home' },
            { label: 'Зірка', value: 'sparkle' },
          ],
        },
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text' },
      ],
    },
    {
      name: 'formHeading',
      type: 'text',
      defaultValue: 'Плануєте весілля? Давайте зафіксуємо дату',
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
