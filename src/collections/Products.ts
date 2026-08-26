import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'
import { slugify } from '@/lib/slugify'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Каталог',
    defaultColumns: ['name', 'categories', 'price', 'inStock', '_status'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
    create: isOwnerOrFlorist,
    update: isOwnerOrFlorist,
    delete: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'pdpHeading',
      type: 'text',
      admin: {
        description: 'Заголовок H1 на сторінці товару, якщо має відрізнятись від назви в кошику/картках (необовʼязково)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, originalDoc, data }) => {
            if (value) return value
            const source = data?.name || originalDoc?.name
            return source ? slugify(String(source)) : value
          },
        ],
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      admin: {
        description: 'Той самий товар може належати кільком категоріям (напр. підписка одночасно й "Підписка на квіти", й "Весільна підписка")',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Базова ціна в копійках (щоб уникнути похибок округлення), напр. 45000 = 450.00 грн',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      admin: {
        description: 'Напр. розмір букета або частота підписки',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'priceModifier',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Копійки, може бути відʼємним',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Якщо вказано, замінює фото товару при виборі цього варіанту',
          },
        },
        {
          name: 'sku',
          type: 'text',
        },
        {
          name: 'recommended',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Позначає варіант як обраний за замовчуванням, з бейджем "Рекомендовано" на сторінці товару',
          },
        },
      ],
    },
    {
      name: 'deliveryFrequencies',
      type: 'array',
      admin: {
        description:
          'Частота доставок для вибору на сторінці товару (напр. Щотижня / Раз на 2 тижні / Щомісяця). Порожньо — блок не показується.',
      },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'deliveryDays',
      type: 'array',
      admin: {
        description: 'Дні доставки для вибору на сторінці товару (напр. Вівторок / П\'ятниця). Порожньо — блок не показується.',
      },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'trustBadges',
      type: 'array',
      admin: {
        description: 'Блок довіри під кнопкою купівлі на сторінці товару (необовʼязково)',
      },
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Емодзі, напр. 🎁' } },
        { name: 'label', type: 'text', required: true, admin: { description: 'Жирний заголовок' } },
        { name: 'note', type: 'text', admin: { description: 'Короткий підпис (необовʼязково)' } },
      ],
    },
    {
      name: 'badge',
      type: 'text',
      admin: {
        description: 'Напр. "ХІТ ПРОДАЖІВ" — стрічка в кутку картки товару (необовʼязково)',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'freeDeliveryBadge',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Показує бейдж "Безкоштовна доставка" на картці товару' },
        },
        {
          name: 'vaseGiftBadge',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Показує бейдж "Ваза у подарунок" на картці товару' },
        },
      ],
    },
    {
      name: 'bullets',
      type: 'array',
      admin: {
        description: 'Список переваг з ✓ на картці товару (необовʼязково)',
      },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'priceSuffixLabel',
      type: 'text',
      admin: {
        description: 'Дрібний текст біля ціни, напр. "1 700 грн / букет" (необовʼязково)',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      admin: {
        description: 'Текст кнопки на картці товару, напр. "Обрати M" (за замовчуванням "У кошик")',
      },
    },
    {
      name: 'highlighted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Виділяє картку та затемнює кнопку (для рекомендованого плану)',
      },
    },
    {
      name: 'audienceTags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Для дому', value: 'home' },
        { label: 'Для бізнесу', value: 'business' },
        { label: 'Тестовий тиждень', value: 'trial' },
      ],
      admin: {
        description: 'Для фільтрів-табів на сторінці категорії (необовʼязково)',
      },
    },
    {
      name: 'crossSell',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Показувати в блоці "Додати до замовлення" в кошику',
      },
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath(`/product/${doc.slug}`)
          revalidatePath('/')
        } catch {
          // No-op outside a Next.js request context (e.g. seed scripts/migrations).
        }
        return doc
      },
    ],
  },
}
