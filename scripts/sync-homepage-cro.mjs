// One-off script: applies the CRO homepage copy/content updates to an
// already-seeded dev DB without re-running the full seed (which would
// hit unique-constraint conflicts on categories/users). Safe to delete
// after running once. Run with: node --env-file=.env --import tsx scripts/sync-homepage-cro.mjs
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const configPath = path.resolve('src/payload.config.ts')
const mod = await import(pathToFileURL(configPath).toString())
const config = await mod.default

const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const ASSETS_DIR = path.resolve('scripts/seed-assets')

async function uploadAsset(filename, alt) {
  const filePath = path.join(ASSETS_DIR, filename)
  const buffer = await fs.readFile(filePath)
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data: buffer, mimetype: 'image/png', name: filename, size: buffer.length },
  })
}

console.log('Updating hero...')
await payload.updateGlobal({
  slug: 'hero',
  data: {
    heading: 'СВІЖІ КВІТИ У ВАШОМУ ДОМІ ЩОТИЖНЯ',
    subheading: 'Спеціальна ваза та флористичний секатор у подарунок до першої підписки',
    ctaButtons: [{ label: 'ОБРАТИ СВІЙ ТАРИФ', href: '/katalog', style: 'primary' }],
  },
})

console.log('Updating ticker text...')
await payload.updateGlobal({
  slug: 'subscription-info',
  data: {
    tickerText:
      '★ Безкоштовна доставка по Києву ★ Ваза та ножиці у подарунок ★ Можливість паузи підписки',
  },
})

console.log('Fetching existing category images to reuse for the formats section...')
const categories = await payload.find({ collection: 'categories', limit: 20 })
const bySlug = Object.fromEntries(categories.docs.map((c) => [c.slug, c]))

console.log('Uploading gift-certificate image...')
const certificateImg = await uploadAsset('flower-2.png', 'Подарунковий сертифікат')

console.log('Seeding formats section...')
await payload.updateGlobal({
  slug: 'formats-section',
  data: {
    cards: [
      {
        title: 'ДЛЯ ДОМУ',
        subtitle: 'Регулярна доставка для затишку вашої оселі',
        buttonLabel: 'Обрати тариф',
        buttonHref: '/katalog/pidpyska',
        image: bySlug['pidpyska']?.image ?? undefined,
      },
      {
        title: 'ДЛЯ БІЗНЕСУ ТА ОФІСІВ',
        subtitle: 'Декор рецепцій, ресторанів та шоурумів (оплата за рахунком)',
        buttonLabel: 'Запросити КП',
        buttonHref: '/business',
        image: bySlug['biznes']?.image ?? undefined,
      },
      {
        title: 'ВЕСІЛЬНА ПІДПИСКА',
        subtitle: 'Подарунок для молодят: місяць квітів після весілля',
        buttonLabel: 'Дізнатися більше',
        buttonHref: '/wedding',
        image: bySlug['vesilna-pidpyska']?.image ?? undefined,
      },
      {
        title: 'ПОДАРУНКОВИЙ СЕРТИФІКАТ',
        subtitle: 'Елегантний бокс із сертифікатом для близьких',
        buttonLabel: 'Купити сертифікат',
        buttonHref: '/gift-certificates',
        image: certificateImg.id,
      },
    ],
  },
})

console.log('Done.')
process.exit(0)
