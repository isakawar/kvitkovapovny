import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isOwnerOrFlorist } from '@/access/isOwnerOrFlorist'

export const SubscriptionInfo: GlobalConfig = {
  slug: 'subscription-info',
  label: 'Блок "Про підписку"',
  admin: {
    group: 'Контент сайту',
  },
  access: {
    read: () => true,
    update: isOwnerOrFlorist,
  },
  fields: [
    {
      name: 'tickerText',
      type: 'text',
      defaultValue:
        '★ Безкоштовна доставка по Києву ★ Ваза та ножиці у подарунок ★ Можливість паузи підписки',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Що таке підписка на квіти?',
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      defaultValue:
        'Підписка на квіти - це регулярна доставка найсвіжіших квіткових композицій з сезонних та екзотичних квітів, прямо до дверей, щоб у домі або офісі завжди була краса та настрій.\n\nВам достатньо обрати частоту доставок та розмір композиції і вже скоро ваша квіткова підписка прямуватиме до вас.',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'frequenciesHeading',
      type: 'text',
      defaultValue: 'Ми пропонуємо 3 частоти доставок:',
    },
    {
      name: 'frequencies',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
      defaultValue: [{ label: 'щотижнева' }, { label: 'раз на два тижні' }, { label: 'щомісячна' }],
    },
    {
      name: 'minimumHeading',
      type: 'text',
      defaultValue: 'Мінімальна підписка включає:',
    },
    {
      name: 'minimumIncludes',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
      defaultValue: [{ label: '4 доставки квіткових композицій' }, { label: 'вазу та флористичні ножиці у подарунок' }],
    },
    {
      name: 'eachDeliveryHeading',
      type: 'text',
      defaultValue: 'Кожна доставка включає:',
    },
    {
      name: 'eachDeliveryIncludes',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
      defaultValue: [
        { label: 'свіжі квіти в оригінальному пакуванні - у коробці, які ви збираєте самостійно у вазу (але також можна замовити вже зібраний букет)' },
        { label: 'інструкцію по догляду' },
        { label: 'підживлення для квітів' },
        { label: 'листівку, в яку ми можемо вписати будь-які побажання' },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Задати питання',
    },
    {
      name: 'ctaHref',
      type: 'text',
      defaultValue: '/contacts',
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
