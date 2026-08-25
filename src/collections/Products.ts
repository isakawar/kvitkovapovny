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
      ],
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
