// Seeds demo content: categories, products, hero, site settings, FAQ, and
// owner/florist test accounts. Run with: npm run seed
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const configPath = path.resolve('src/payload.config.ts')
const mod = await import(pathToFileURL(configPath).toString())
const config = await mod.default

const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const ASSETS_DIR = path.resolve('scripts/seed-assets')
const MIME_BY_EXT = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4' }

async function uploadAsset(filename, alt) {
  const filePath = path.join(ASSETS_DIR, filename)
  const buffer = await fs.readFile(filePath)
  const ext = path.extname(filename).toLowerCase()
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data: buffer, mimetype: MIME_BY_EXT[ext], name: filename, size: buffer.length },
  })
}

// Builds a Lexical richText value from plain paragraphs (one string per paragraph).
function richText(paragraphs) {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  }
}

console.log('Seeding media from old site (kvitkovapovnya.com)...')
const heroVideo = await uploadAsset('hero.mp4', 'Квіткова підписка — відео')
const heroImage = await uploadAsset('lifestyle-peonies.png', 'Флористка складає букет піонів')
const catSubscriptionImg = await uploadAsset('sub-m.png', 'Підписка на квіти')
const catBouquetsImg = await uploadAsset('buket-m.png', 'Букети')
const catWeddingImg = await uploadAsset('wedding-1.jpg', 'Весільна підписка')
const catBusinessImg = await uploadAsset('vase-cafe.png', 'Підписка для бізнесу')

console.log('Seeding categories...')
// Created sequentially (not Promise.all) — concurrent creates on a drafts-enabled
// collection have been observed to leave one document stuck in draft status.
const pidpyska = await payload.create({
  collection: 'categories',
  data: {
    name: 'Підписка на квіти',
    slug: 'pidpyska',
    description: 'Регулярна доставка свіжих квіткових композицій.',
    image: catSubscriptionImg.id,
    sortOrder: 1,
    _status: 'published',
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
const buket = await payload.create({
  collection: 'categories',
  data: {
    name: 'Букети',
    slug: 'buket',
    description: 'Разова доставка букета на будь-який привід.',
    image: catBouquetsImg.id,
    sortOrder: 2,
    _status: 'published',
  },
})
const vesilna = await payload.create({
  collection: 'categories',
  data: {
    name: 'Весільна підписка',
    slug: 'vesilna-pidpyska',
    description: 'Квіткова підписка для нареченої й весільних приготувань.',
    image: catWeddingImg.id,
    sortOrder: 3,
    _status: 'published',
  },
})
const biznes = await payload.create({
  collection: 'categories',
  data: {
    name: 'Підписка для бізнесу',
    slug: 'biznes',
    description: 'Регулярні квіткові композиції для офісу чи закладу.',
    image: catBusinessImg.id,
    sortOrder: 4,
    _status: 'published',
  },
})

console.log('Seeding products...')
const subM = await uploadAsset('sub-m.png', 'Підписка на квіти M')
const subL = await uploadAsset('sub-l.png', 'Підписка на квіти L')
const subXl = await uploadAsset('sub-xl.png', 'Підписка на квіти XL')
const subXxl = await uploadAsset('sub-xxl.png', 'Підписка на квіти XXL')
const buketM = await uploadAsset('buket-m.png', 'Букет M')
const buketL = await uploadAsset('buket-l.png', 'Букет L')
const buketXl = await uploadAsset('buket-xl.png', 'Букет XL')
const buketXxl = await uploadAsset('buket-xxl.png', 'Букет XXL')

// Sequential for the same reason as categories above.
// Real pricing pulled from kvitkovapovnya.com/category/підписка-на-квіти:
// M 6800 / L 8800 / XL 10800 / XXL 16000 грн. On the live site this same
// subscription is cross-listed under "Весільна підписка" and (assumed,
// same pattern) "Підписка для бізнесу" — modeled here as one product in
// three categories rather than duplicating it three times.
await payload.create({
  collection: 'products',
  data: {
    name: 'Підписка на квіти',
    slug: 'pidpyska-na-kvity',
    categories: [vesilna.id, biznes.id],
    price: 680000,
    description: richText([
      'Підписка включає 4 доставки свіжих квіткових композицій із періодичністю на ваш вибір — щотижнева, раз на два тижні або щомісячна.',
      'Розмір визначає обʼєм композиції: від компактного M до пишного XXL. Змінити розмір чи періодичність можна в будь-який момент.',
      'До кожної доставки додається інструкція по догляду, підживлення для квітів та листівка з вашими побажаннями.',
    ]),
    images: [{ image: subM.id, alt: 'Підписка на квіти' }],
    variants: [
      { label: 'M', priceModifier: 0, image: subM.id },
      { label: 'L', priceModifier: 200000, image: subL.id },
      { label: 'XL', priceModifier: 400000, image: subXl.id },
      { label: 'XXL', priceModifier: 920000, image: subXxl.id },
    ],
    inStock: true,
    featured: true,
    sortOrder: 1,
    _status: 'published',
  },
})
// Real pricing from kvitkovapovnya.com/category/разова-доставка:
// M 1900 / L 2400 / XL 2900 / XXL 4500 грн.
await payload.create({
  collection: 'products',
  data: {
    name: 'Букет',
    slug: 'buket',
    categories: [buket.id],
    price: 190000,
    description: richText([
      'Разова доставка свіжого букета без оформлення підписки — на подарунок або для себе.',
      'Оберіть розмір від компактного M до вражаючого XXL, і ми складемо букет із сезонних квітів.',
      'Букет приходить у фірмовому пакуванні з інструкцією по догляду.',
    ]),
    images: [{ image: buketM.id, alt: 'Букет' }],
    variants: [
      { label: 'M', priceModifier: 0, image: buketM.id },
      { label: 'L', priceModifier: 50000, image: buketL.id },
      { label: 'XL', priceModifier: 100000, image: buketXl.id },
      { label: 'XXL', priceModifier: 260000, image: buketXxl.id },
    ],
    inStock: true,
    featured: true,
    sortOrder: 2,
    _status: 'published',
  },
})

console.log('Seeding pidpyska pricing plans...')
await payload.create({
  collection: 'products',
  data: {
    name: 'Тестовий букет (1 доставка)',
    slug: 'testovyi-buket',
    categories: [pidpyska.id],
    price: 120000,
    images: [{ image: subM.id, alt: 'Тестовий букет' }],
    bullets: [
      { label: '1 пробна доставка' },
      { label: 'Професійний секатор у подарунок' },
      { label: 'Безкоштовна доставка' },
    ],
    ctaLabel: 'Спробувати',
    audienceTags: ['trial'],
    inStock: true,
    sortOrder: 1,
    _status: 'published',
  },
})
await payload.create({
  collection: 'products',
  data: {
    name: 'Підписка S (Затишна)',
    slug: 'pidpyska-s',
    categories: [pidpyska.id],
    price: 400000,
    priceSuffixLabel: '1 000 грн / букет',
    images: [{ image: subM.id, alt: 'Підписка S' }],
    bullets: [{ label: '4 доставки букетів' }, { label: 'Ваза у подарунок' }, { label: 'Зміна днів доставки' }],
    ctaLabel: 'Обрати S',
    audienceTags: ['home', 'business'],
    inStock: true,
    sortOrder: 2,
    _status: 'published',
  },
})
await payload.create({
  collection: 'products',
  data: {
    name: 'Підписка M (Класична)',
    slug: 'pidpyska-m',
    categories: [pidpyska.id],
    price: 680000,
    priceSuffixLabel: '1 700 грн / букет',
    images: [{ image: subL.id, alt: 'Підписка M' }],
    bullets: [
      { label: '4 великі композиції' },
      { label: 'Ваза + секатор у подарунок' },
      { label: 'Безкоштовна доставка' },
    ],
    badge: 'ХІТ ПРОДАЖІВ',
    ctaLabel: 'Обрати M',
    highlighted: true,
    audienceTags: ['home', 'business'],
    inStock: true,
    featured: true,
    sortOrder: 3,
    _status: 'published',
  },
})
await payload.create({
  collection: 'products',
  data: {
    name: 'Підписка L (Пишна)',
    slug: 'pidpyska-l',
    categories: [pidpyska.id],
    price: 1120000,
    priceSuffixLabel: '2 800 грн / букет',
    images: [{ image: subXl.id, alt: 'Підписка L' }],
    bullets: [
      { label: '4 преміум композиції' },
      { label: 'Ваза + секатор у подарунок' },
      { label: 'Персональний флорист' },
    ],
    ctaLabel: 'Обрати L',
    audienceTags: ['home', 'business'],
    inStock: true,
    sortOrder: 4,
    _status: 'published',
  },
})

console.log('Seeding hero + site settings...')
await payload.updateGlobal({
  slug: 'hero',
  data: {
    heading: 'СВІЖІ КВІТИ У ВАШОМУ ДОМІ ЩОТИЖНЯ',
    subheading: 'Спеціальна ваза та флористичний секатор у подарунок до першої підписки',
    video: heroVideo.id,
    fallbackImage: heroImage.id,
    ctaButtons: [{ label: 'ОБРАТИ СВІЙ ТАРИФ', href: '/katalog', style: 'primary' }],
  },
})

// Real logo file (transparent PNG, pre-trimmed — see scripts/seed-assets/logo.png).
// If this file is ever removed, the storefront falls back to a crisp SVG+text
// lockup (src/components/storefront/Logo.tsx) instead of breaking.
const logo = await uploadAsset('logo.png', 'kvitkova povnya')
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    logo: logo.id,
    contactPhone: '+380000000000',
    contactEmail: 'hello@kvitkovapovnya.com',
    instagramUrl: 'https://instagram.com/kvitkovapovnya',
    deliveryCities: [{ name: 'Київ', active: true }],
    faqItems: [
      { question: 'Що таке підписка на квіти?', answer: 'Регулярна доставка свіжих квіткових композицій прямо до дверей.', sortOrder: 1 },
      { question: 'Як оформити замовлення?', answer: 'Оберіть товар або підписку в каталозі, додайте в кошик і заповніть форму доставки.', sortOrder: 2 },
      { question: 'Що входить в підписку?', answer: 'Квіти в оригінальному пакуванні, інструкція по догляду, підживлення та листівка.', sortOrder: 3 },
      { question: 'Яку періодичність доставок я можу обрати?', answer: 'Щотижнева, раз на два тижні або щомісячна.', sortOrder: 4 },
      { question: 'В якому пакуванні приходять квіти?', answer: 'У коробці, квіти збираєте у вазу самостійно, або замовте вже зібраний букет.', sortOrder: 5 },
      { question: "Чи обов'язково купляти підписку, чи можна оформити разову доставку?", answer: 'Можна замовити разовий букет без оформлення підписки.', sortOrder: 6 },
    ],
  },
})

console.log('Seeding subscription info block...')
const subscriptionImage = await uploadAsset('lifestyle-peonies.png', 'Флористка складає букет піонів')
await payload.updateGlobal({
  slug: 'subscription-info',
  data: {
    tickerText:
      '★ Безкоштовна доставка по Києву ★ Ваза та ножиці у подарунок ★ Можливість паузи підписки',
    heading: 'Що таке підписка на квіти?',
    intro:
      'Підписка на квіти - це регулярна доставка найсвіжіших квіткових композицій з сезонних та екзотичних квітів, прямо до дверей, щоб у домі або офісі завжди була краса та настрій.\n\nВам достатньо обрати частоту доставок та розмір композиції і вже скоро ваша квіткова підписка прямуватиме до вас.',
    image: subscriptionImage.id,
    frequenciesHeading: 'Ми пропонуємо 3 частоти доставок:',
    frequencies: [{ label: 'щотижнева' }, { label: 'раз на два тижні' }, { label: 'щомісячна' }],
    minimumHeading: 'Мінімальна підписка включає:',
    minimumIncludes: [
      { label: '4 доставки квіткових композицій' },
      { label: 'вазу та флористичні ножиці у подарунок' },
    ],
    eachDeliveryHeading: 'Кожна доставка включає:',
    eachDeliveryIncludes: [
      { label: 'свіжі квіти в оригінальному пакуванні - у коробці, які ви збираєте самостійно у вазу (але також можна замовити вже зібраний букет)' },
      { label: 'інструкцію по догляду' },
      { label: 'підживлення для квітів' },
      { label: 'листівку, в яку ми можемо вписати будь-які побажання' },
    ],
    ctaLabel: 'Задати питання',
    ctaHref: '/contacts',
  },
})

console.log('Seeding wedding page + Instagram posts...')
const weddingCover = await uploadAsset('wedding-1.jpg', 'Весільне оформлення Квіткова Повня')
await payload.updateGlobal({
  slug: 'wedding-page',
  data: {
    heading: 'Квіткове оформлення весілля',
    intro:
      'Розробляємо індивідуальне квіткове оформлення під ваше весілля: арки, композиції на столи, букет нареченої, бутоньєрки. Кожен проєкт — окремий розрахунок під бюджет і стилістику свята.',
    coverImage: weddingCover.id,
    gallery: [{ image: weddingCover.id, caption: 'Церемонія біля озера' }],
    contactNote: "Залиште заявку — зв'яжемось для безкоштовної консультації протягом дня.",
  },
})

console.log('Seeding formats section...')
const certificateImg = await uploadAsset('flower-2.png', 'Подарунковий сертифікат')
await payload.updateGlobal({
  slug: 'formats-section',
  data: {
    cards: [
      {
        title: 'ДЛЯ ДОМУ',
        subtitle: 'Регулярна доставка для затишку вашої оселі',
        buttonLabel: 'Обрати тариф',
        buttonHref: '/katalog/pidpyska',
        image: catSubscriptionImg.id,
        sortOrder: 1,
      },
      {
        title: 'ДЛЯ БІЗНЕСУ ТА ОФІСІВ',
        subtitle: 'Декор рецепцій, ресторанів та шоурумів (оплата за рахунком)',
        buttonLabel: 'Запросити КП',
        buttonHref: '/business',
        image: catBusinessImg.id,
        sortOrder: 2,
      },
      {
        title: 'ВЕСІЛЬНА ПІДПИСКА',
        subtitle: 'Подарунок для молодят: місяць квітів після весілля',
        buttonLabel: 'Дізнатися більше',
        buttonHref: '/wedding',
        image: catWeddingImg.id,
        sortOrder: 3,
      },
      {
        title: 'ПОДАРУНКОВИЙ СЕРТИФІКАТ',
        subtitle: 'Елегантний бокс із сертифікатом для близьких',
        buttonLabel: 'Купити сертифікат',
        buttonHref: '/gift-certificates',
        image: certificateImg.id,
        sortOrder: 4,
      },
    ],
  },
})

const igFiles = ['ig-1.jpg', 'ig-2.jpg', 'ig-3.jpg', 'ig-4.jpg', 'ig-5.jpg', 'ig-6.jpg']
const igMedia = await Promise.all(igFiles.map((f) => uploadAsset(f, 'Instagram — kvitkovapovnya')))
// Testimonials are screenshots of Instagram Story Highlights (e.g. "відгуки") uploaded
// by the client — Instagram has no public API for pulling Highlights automatically.
// Demo-seeded here by reusing two of the Instagram post images above as placeholders;
// replace with real review screenshots via /admin.
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    instagramPosts: igMedia.map((m) => ({ image: m.id, link: 'https://instagram.com/kvitkovapovnya' })),
    testimonials: [
      { image: igMedia[0].id, authorName: 'Олена' },
      { image: igMedia[1].id, authorName: 'Марина' },
    ],
  },
})

console.log('Seeding test accounts...')
await payload.create({
  collection: 'users',
  data: { name: 'Власник', email: 'owner@kvitkovapovnya.com', password: 'owner12345', role: 'owner' },
})
await payload.create({
  collection: 'users',
  data: { name: 'Флорист', email: 'florist@kvitkovapovnya.com', password: 'florist12345', role: 'florist' },
})

console.log('Done. Owner login: owner@kvitkovapovnya.com / owner12345')
console.log('Florist login: florist@kvitkovapovnya.com / florist12345')

process.exit(0)
