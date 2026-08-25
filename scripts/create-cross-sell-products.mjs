// One-off script: creates the two cross-sell add-on products shown in the
// cart drawer ("Додати до замовлення" block) — Свічка and Аромадифузор.
// Photos are placeholders reused from existing seed assets; replace with real
// product photos via /admin. Safe to delete after running once.
// Run with: node --env-file=.env --import tsx scripts/create-cross-sell-products.mjs
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
    file: { data: buffer, mimetype: 'image/jpeg', name: filename, size: buffer.length },
  })
}

console.log('Finding buket category (used to satisfy the required categories field)...')
const categoryResult = await payload.find({ collection: 'categories', where: { slug: { equals: 'buket' } }, limit: 1 })
const buket = categoryResult.docs[0]
if (!buket) throw new Error('buket category not found')

const candleImg = await findOrUploadMedia('ig-3.jpg', 'Свічка')
const diffuserImg = await findOrUploadMedia('ig-4.jpg', 'Аромадифузор')

const products = [
  { name: 'Свічка', slug: 'svichka', price: 35000, image: candleImg },
  { name: 'Аромадифузор', slug: 'aromadyfuzor', price: 45000, image: diffuserImg },
]

for (const p of products) {
  const existing = await payload.find({ collection: 'products', where: { slug: { equals: p.slug } }, limit: 1 })
  if (existing.docs[0]) {
    console.log(`  ${p.slug} already exists, updating crossSell flag`)
    await payload.update({ collection: 'products', id: existing.docs[0].id, data: { crossSell: true } })
    continue
  }
  await payload.create({
    collection: 'products',
    data: {
      name: p.name,
      slug: p.slug,
      categories: [buket.id],
      price: p.price,
      images: [{ image: p.image.id, alt: p.name }],
      crossSell: true,
      inStock: true,
      _status: 'published',
    },
  })
  console.log(`  created ${p.slug}`)
}

console.log('Done.')
process.exit(0)
