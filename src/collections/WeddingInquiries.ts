import type { CollectionConfig } from 'payload'

import { isOwner } from '@/access/isOwner'
import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const WeddingInquiries: CollectionConfig = {
  slug: 'wedding-inquiries',
  admin: {
    useAsTitle: 'customerName',
    group: 'Весілля',
    defaultColumns: ['customerName', 'phone', 'weddingDate', 'status', 'createdAt'],
  },
  access: {
    // Submitted through the validated `createWeddingInquiry` server action only.
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
    { name: 'email', type: 'text' },
    { name: 'weddingDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'guestsCount', type: 'number' },
    { name: 'budget', type: 'text', admin: { description: "Орієнтовний бюджет, напр. '20000-30000 грн'" } },
    { name: 'comment', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Нова заявка', value: 'new' },
        { label: 'На звʼязку', value: 'contacted' },
        { label: 'Консультація призначена', value: 'consultation_scheduled' },
        { label: 'Угода', value: 'won' },
        { label: 'Відмова', value: 'lost' },
      ],
    },
  ],
}
