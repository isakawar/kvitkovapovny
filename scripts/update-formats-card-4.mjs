// One-off script: swaps the 4th homepage "formats" card (was "Подарунковий
// сертифікат") for the real "Букети разова доставка" category, per owner
// request. Safe to delete after running once.
// Run with: node --env-file=.env --import tsx scripts/update-formats-card-4.mjs
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const configPath = path.resolve('src/payload.config.ts')
const mod = await import(pathToFileURL(configPath).toString())
const config = await mod.default

const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log('Finding buket category...')
const categoryResult = await payload.find({ collection: 'categories', where: { slug: { equals: 'buket' } }, limit: 1 })
const buket = categoryResult.docs[0]
if (!buket) throw new Error('buket category not found')

console.log('Updating formats-section card 4...')
const formatsSection = await payload.findGlobal({ slug: 'formats-section' })
const cards = [...(formatsSection.cards || [])]
cards[3] = {
  title: 'БУКЕТИ РАЗОВА ДОСТАВКА',
  subtitle: 'Букет на будь-який привід без оформлення підписки',
  buttonLabel: 'Обрати букет',
  buttonHref: `/katalog/${buket.slug}`,
  image: buket.image,
}

await payload.updateGlobal({ slug: 'formats-section', data: { cards } })
console.log('Done.')
process.exit(0)
