import type { CollectionConfig } from 'payload'

import { isOwner } from '@/access/isOwner'
import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const CustomBouquetRequests: CollectionConfig = {
  slug: 'custom-bouquet-requests',
  admin: {
    useAsTitle: 'customerName',
    group: 'Замовлення',
    defaultColumns: ['customerName', 'phone', 'gamma', 'budget', 'status', 'createdAt'],
  },
  access: {
    // Submitted through the validated `createCustomBouquetRequest` server action only.
    create: () => true,
    read: isOwnerOrFlorist,
    update: isOwnerOrFlorist,
    delete: isOwner,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'customerName', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
      ],
    },
    {
      name: 'gamma',
      type: 'select',
      required: true,
      options: [
        { label: 'Ніжна', value: 'gentle' },
        { label: 'Яскрава', value: 'bright' },
        { label: 'Біла / Класична', value: 'classic' },
        { label: 'На розсуд флориста', value: 'florist_choice' },
      ],
    },
    {
      name: 'budget',
      type: 'number',
      required: true,
      admin: { description: 'Копійки' },
    },
    { name: 'occasion', type: 'text', admin: { description: 'Привід (необовʼязково)' } },
    { name: 'likedFlowers', type: 'textarea', admin: { description: 'Улюблені квіти' } },
    { name: 'dislikedFlowers', type: 'textarea', admin: { description: 'Небажані квіти' } },
    { name: 'cardMessage', type: 'textarea', admin: { description: 'Текст листівки' } },
    { name: 'referencePhoto', type: 'upload', relationTo: 'media' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Нова заявка', value: 'new' },
        { label: 'На звʼязку', value: 'contacted' },
        { label: 'У роботі', value: 'in_progress' },
        { label: 'Виконано', value: 'done' },
        { label: 'Скасовано', value: 'cancelled' },
      ],
    },
  ],
}
