import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const FormatsSection: GlobalConfig = {
  slug: 'formats-section',
  label: 'Блок "Формати підписки"',
  admin: {
    group: 'Головна сторінка',
    description: 'Блок із 4 картками під головним банером (дім, букети, бізнес, весілля)',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Наші послуги',
    },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      defaultValue: [
        {
          title: 'ДЛЯ ДОМУ',
          subtitle: 'Регулярна підписка для затишку вашої оселі',
          buttonLabel: 'Обрати тариф',
          buttonHref: '/katalog/pidpyska',
          sortOrder: 1,
        },
        {
          title: 'БУКЕТИ',
          subtitle: 'Разова доставка авторських свіжих букетів',
          buttonLabel: 'Переглянути каталог',
          buttonHref: '/katalog/buket',
          sortOrder: 2,
        },
        {
          title: 'ДЛЯ БІЗНЕСУ ТА ОФІСІВ',
          subtitle: 'Оформлення рецепцій, ресторанів, шоурумів',
          buttonLabel: 'Запросити КП',
          buttonHref: '/business',
          sortOrder: 3,
        },
        {
          title: 'ВЕСІЛЬНА ФЛОРИСТИКА',
          subtitle: 'Декор подій та весільні підписки',
          buttonLabel: 'Дізнатися більше',
          buttonHref: '/wedding',
          sortOrder: 4,
        },
      ],
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text', required: true },
        { name: 'buttonLabel', type: 'text', required: true },
        { name: 'buttonHref', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          admin: {
            position: 'sidebar',
            description: 'Визначає порядок карток зліва направо (менше число — раніше)',
          },
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
