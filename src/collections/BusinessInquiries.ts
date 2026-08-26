import type { CollectionConfig } from 'payload'

import { isOwner } from '@/access/isOwner'
import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const BusinessInquiries: CollectionConfig = {
  slug: 'business-inquiries',
  admin: {
    useAsTitle: 'companyName',
    group: 'B2B',
    defaultColumns: ['companyName', 'contactPerson', 'phone', 'businessType', 'status', 'createdAt'],
  },
  access: {
    // Submitted through the validated `createBusinessInquiry` server action only.
    create: () => true,
    read: isOwnerOrFlorist,
    update: isOwnerOrFlorist,
    delete: isOwner,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'companyName', type: 'text', required: true },
        { name: 'contactPerson', type: 'text', required: true },
      ],
    },
    { name: 'phone', type: 'text', required: true },
    {
      name: 'businessType',
      type: 'select',
      required: true,
      options: [
        { label: 'Ресторан', value: 'restaurant' },
        { label: 'Готель', value: 'hotel' },
        { label: 'Б\'юті-салон', value: 'beauty' },
        { label: 'IT-офіс', value: 'it_office' },
        { label: 'Шоурум', value: 'showroom' },
        { label: 'Інше', value: 'other' },
      ],
    },
    {
      name: 'budgetOrLocations',
      type: 'text',
      admin: { description: "Орієнтовний бюджет або кількість локацій, напр. '3 локації, 15000 грн/міс'" },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Нова заявка', value: 'new' },
        { label: 'На звʼязку', value: 'contacted' },
        { label: 'Тестовий тиждень', value: 'trial_week' },
        { label: 'Угода', value: 'won' },
        { label: 'Відмова', value: 'lost' },
      ],
    },
  ],
}
