import type { CollectionConfig, FieldAccess } from 'payload'

import { isOwner } from '@/access/isOwner'

const isOwnerField: FieldAccess = ({ req: { user } }) => Boolean(user && user.role === 'owner')

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    group: 'Адміністрування',
  },
  auth: true,
  access: {
    create: isOwner,
    read: ({ req: { user } }) => {
      if (user?.role === 'owner') return true
      if (user) return { id: { equals: user.id } }
      return false
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'owner') return true
      if (user) return { id: { equals: user.id } }
      return false
    },
    delete: isOwner,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'florist',
      options: [
        { label: 'Власник', value: 'owner' },
        { label: 'Флорист', value: 'florist' },
      ],
      access: {
        // Only an owner may change a user's role (prevents a florist from self-promoting).
        update: isOwnerField,
      },
    },
  ],
}
