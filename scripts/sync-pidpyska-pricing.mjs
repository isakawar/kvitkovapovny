// One-off script: applies the "Підписка на квіти" pricing-grid redesign to an
// already-seeded dev DB (adds category FAQ, detaches the old cross-listed
// product from pidpyska, creates the 4 new pricing-plan products) without
// re-running the full seed. Safe to delete after running once.
// Run with: node --env-file=.env --import tsx scripts/sync-pidpyska-pricing.mjs
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const configPath = path.resolve('src/payload.config.ts')
const mod = await import(pathToFileURL(configPath).toString())
const config = await mod.default

const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log('Finding pidpyska category and existing media...')
const categoriesResult = await payload.find({ collection: 'categories', where: { slug: { equals: 'pidpyska' } }, limit: 1 })
const pidpyska = categoriesResult.docs[0]
if (!pidpyska) throw new Error('pidpyska category not found — run the full seed first')

const mediaResult = await payload.find({
  collection: 'media',
  where: { filename: { in: ['sub-m.png', 'sub-l.png', 'sub-xl.png'] } },
  limit: 10,
})
const mediaByFilename = Object.fromEntries(mediaResult.docs.map((m) => [m.filename, m]))
const subM = mediaByFilename['sub-m.png']
const subL = mediaByFilename['sub-l.png']
const subXl = mediaByFilename['sub-xl.png']
if (!subM || !subL || !subXl) throw new Error('Expected seed images not found in media collection')

console.log('Adding FAQ to pidpyska category...')
await payload.update({
  collection: 'categories',
  id: pidpyska.id,
  data: {
    faqItems: [
      {
        question: 'Як доглядати за квітами з підписки?',
        answer:
          'До кожної доставки додається інструкція по догляду та підживлення для квітів. Свіжі стебла, чиста вода та прохолодне місце без прямого сонця подовжують життя букета.',
      },
      {
        question: 'Чи можна замінити квіти в композиції?',
        answer:
          'Так, напишіть побажання перед доставкою (напр. без лілій чи певний колір) — флорист врахує їх при складанні композиції в межах сезонної наявності.',
      },
      {
        question: 'Чи можна поставити підписку на паузу під час відпустки?',
        answer:
          'Так, паузу або перенесення дати доставки можна оформити в особистому кабінеті або написавши нам заздалегідь.',
      },
    ],
  },
})

console.log('Detaching old cross-listed product from pidpyska category...')
const oldProductResult = await payload.find({ collection: 'products', where: { slug: { equals: 'pidpyska-na-kvity' } }, limit: 1 })
const oldProduct = oldProductResult.docs[0]
if (oldProduct) {
  const remainingCategories = (oldProduct.categories || [])
    .map((c) => (typeof c === 'number' ? c : c.id))
    .filter((id) => id !== pidpyska.id)
  await payload.update({ collection: 'products', id: oldProduct.id, data: { categories: remainingCategories } })
}

console.log('Creating pidpyska pricing plan products...')
const plans = [
  {
    name: 'Тестовий букет (1 доставка)',
    slug: 'testovyi-buket',
    price: 120000,
    image: subM,
    bullets: ['1 пробна доставка', 'Професійний секатор у подарунок', 'Безкоштовна доставка'],
    ctaLabel: 'Спробувати',
    audienceTags: ['trial'],
    sortOrder: 1,
  },
  {
    name: 'Підписка S (Затишна)',
    slug: 'pidpyska-s',
    price: 400000,
    priceSuffixLabel: '1 000 грн / букет',
    image: subM,
    bullets: ['4 доставки букетів', 'Ваза у подарунок', 'Зміна днів доставки'],
    ctaLabel: 'Обрати S',
    audienceTags: ['home', 'business'],
    sortOrder: 2,
  },
  {
    name: 'Підписка M (Класична)',
    slug: 'pidpyska-m',
    price: 680000,
    priceSuffixLabel: '1 700 грн / букет',
    image: subL,
    bullets: ['4 великі композиції', 'Ваза + секатор у подарунок', 'Безкоштовна доставка'],
    badge: 'ХІТ ПРОДАЖІВ',
    ctaLabel: 'Обрати M',
    highlighted: true,
    featured: true,
    audienceTags: ['home', 'business'],
    sortOrder: 3,
  },
  {
    name: 'Підписка L (Пишна)',
    slug: 'pidpyska-l',
    price: 1120000,
    priceSuffixLabel: '2 800 грн / букет',
    image: subXl,
    bullets: ['4 преміум композиції', 'Ваза + секатор у подарунок', 'Персональний флорист'],
    ctaLabel: 'Обрати L',
    audienceTags: ['home', 'business'],
    sortOrder: 4,
  },
]

for (const plan of plans) {
  const existing = await payload.find({ collection: 'products', where: { slug: { equals: plan.slug } }, limit: 1 })
  if (existing.docs[0]) {
    console.log(`  ${plan.slug} already exists, skipping`)
    continue
  }
  await payload.create({
    collection: 'products',
    data: {
      name: plan.name,
      slug: plan.slug,
      categories: [pidpyska.id],
      price: plan.price,
      priceSuffixLabel: plan.priceSuffixLabel,
      images: [{ image: plan.image.id, alt: plan.name }],
      bullets: plan.bullets.map((label) => ({ label })),
      badge: plan.badge,
      ctaLabel: plan.ctaLabel,
      highlighted: plan.highlighted ?? false,
      featured: plan.featured ?? false,
      audienceTags: plan.audienceTags,
      inStock: true,
      sortOrder: plan.sortOrder,
      _status: 'published',
    },
  })
  console.log(`  created ${plan.slug}`)
}

console.log('Done.')
process.exit(0)
