// One-off script: fills in the redesigned product-detail-page content for the
// "Підписка на квіти «Класична»" plan (slug pidpyska-m) — gallery, size/frequency/
// delivery-day options, CTA, trust badges. Safe to delete after running once.
// Run with: node --env-file=.env --import tsx scripts/update-pidpyska-m-pdp.mjs
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const configPath = path.resolve('src/payload.config.ts')
const mod = await import(pathToFileURL(configPath).toString())
const config = await mod.default

const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const ASSETS_DIR = path.resolve('scripts/seed-assets')

async function findOrUploadMedia(filename, alt) {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  const buffer = await fs.readFile(path.join(ASSETS_DIR, filename))
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data: buffer, mimetype: 'image/png', name: filename, size: buffer.length },
  })
}

console.log('Finding pidpyska-m product...')
const result = await payload.find({ collection: 'products', where: { slug: { equals: 'pidpyska-m' } }, limit: 1 })
const product = result.docs[0]
if (!product) throw new Error('pidpyska-m product not found')

console.log('Resolving gallery images...')
const lifestyleImg = await findOrUploadMedia('lifestyle-peonies.png', 'Букет у вазі в інтер\'єрі')
const vaseImg = await findOrUploadMedia('vase-cafe.png', 'Ваза та секатор у подарунок')
const handHeldImg = await findOrUploadMedia('flower-1.png', 'Букет у руках')
const unboxingImg = await findOrUploadMedia('ig-2.jpg', 'Розпакування боксу підписки')

console.log('Updating pidpyska-m product...')
await payload.update({
  collection: 'products',
  id: product.id,
  data: {
    pdpHeading: 'Підписка на квіти «Класична»',
    priceSuffixLabel: '1 700 грн за один букет',
    ctaLabel: 'ОФОРМИТИ ПІДПИСКУ',
    images: [
      { image: lifestyleImg.id, alt: 'Букет у вазі на столі в інтер\'єрі' },
      { image: vaseImg.id, alt: 'Ваза та секатор у фірмовій коробці' },
      { image: handHeldImg.id, alt: 'Букет у руках' },
      { image: unboxingImg.id, alt: 'Розпакування боксу підписки' },
    ],
    variants: [
      { label: 'S', priceModifier: -180000, sku: 'PIDPYSKA-S' },
      { label: 'M', priceModifier: 0, recommended: true, sku: 'PIDPYSKA-M' },
      { label: 'L', priceModifier: 200000, sku: 'PIDPYSKA-L' },
      { label: 'XXL', priceModifier: 600000, sku: 'PIDPYSKA-XXL' },
    ],
    deliveryFrequencies: [{ label: 'Щотижня' }, { label: 'Раз на 2 тижні' }, { label: 'Щомісяця' }],
    deliveryDays: [{ label: 'Вівторок' }, { label: "П'ятниця" }],
    trustBadges: [
      { icon: '🎁', label: 'Ваза та секатор у подарунок', note: 'до першої доставки' },
      { icon: '🚚', label: 'Безкоштовна доставка', note: "кур'єром до дверей по Києву" },
      {
        icon: '🔄',
        label: 'Гнучка пауза:',
        note: 'переносьте або скасовуйте доставки в 1 клік у кабінеті',
      },
    ],
  },
})

console.log('Done.')
process.exit(0)
