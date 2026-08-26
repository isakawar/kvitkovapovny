import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { WeddingInquiries } from './collections/WeddingInquiries'
import { Hero } from './globals/Hero'
import { SiteSettings } from './globals/SiteSettings'
import { SubscriptionInfo } from './globals/SubscriptionInfo'
import { WeddingPage } from './globals/WeddingPage'
import { FormatsSection } from './globals/FormatsSection'
import { InstagramIntegration } from './globals/InstagramIntegration'
import { FeatureStrip } from './globals/FeatureStrip'
import { HowItWorksSection } from './globals/HowItWorksSection'
import { SubscriptionPricing } from './globals/SubscriptionPricing'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Products, Orders, WeddingInquiries],
  globals: [
    Hero,
    SiteSettings,
    SubscriptionInfo,
    WeddingPage,
    FormatsSection,
    InstagramIntegration,
    FeatureStrip,
    HowItWorksSection,
    SubscriptionPricing,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: true,
    // Only wire up prodMigrations when explicitly asked to (set in the
    // Docker image — see Dockerfile). Passing `prodMigrations` at all makes
    // Payload check for dev/push drift during `next build`, which always
    // runs with NODE_ENV=production — that turned plain local `npm run
    // build` against the push-synced dev DB into a hung interactive prompt
    // ("data loss will occur, proceed? y/N") with no stdin to answer it.
    // Local dev never sets this flag, so it keeps using push like before.
    prodMigrations: process.env.PAYLOAD_USE_MIGRATIONS === 'true' ? migrations : undefined,
  }),
  sharp,
  plugins: [],
})
