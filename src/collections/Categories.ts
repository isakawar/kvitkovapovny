import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'
import { slugify } from '@/lib/slugify'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Каталог',
    defaultColumns: ['name', 'sortOrder', '_status'],
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
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
          revalidatePath(`/katalog/${doc.slug}`)
          revalidatePath('/')
        } catch {
          // No-op outside a Next.js request context (e.g. seed scripts/migrations).
        }
        return doc
      },
    ],
  },
}
