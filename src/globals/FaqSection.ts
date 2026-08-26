import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const FaqSection: GlobalConfig = {
  slug: 'faq-section',
  label: 'Часті запитання',
  admin: {
    group: 'Довідка',
    description: 'Питання-відповіді в акордеоні "Часті запитання" внизу головної сторінки',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'faqItems',
      type: 'array',
      label: 'Питання',
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
          revalidatePath('/')
        } catch {
          // No-op outside a Next.js request context (e.g. seed scripts).
        }
        return doc
      },
    ],
  },
}
