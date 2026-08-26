import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Copy existing subscription-pricing sizes (price/badge) into the highlighted
  // "Підписка на квіти" product's variants[] before the source columns are dropped,
  // so no admin-entered pricing is lost when this global stops owning price data.
  const oldSizes = (
    await db.execute<{ label: string; price: string; badge: string | null }>(sql`
      SELECT "label", "price", "badge" FROM "subscription_pricing_sizes" ORDER BY "_order" ASC
    `)
  ).rows

  if (oldSizes.length > 0) {
    const category = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'pidpyska' } },
      limit: 1,
      req,
    })

    const product = category.docs[0]
      ? (
          await payload.find({
            collection: 'products',
            where: {
              and: [{ categories: { in: [category.docs[0].id] } }, { highlighted: { equals: true } }],
            },
            limit: 1,
            req,
          })
        ).docs[0]
      : undefined

    if (product) {
      const basePrice = product.price ?? 0
      const existingVariants = product.variants || []
      const mergedVariants = [...existingVariants]

      for (const size of oldSizes) {
        if (!size.label) continue
        const priceModifier = Math.round(Number(size.price ?? 0)) - basePrice
        const idx = mergedVariants.findIndex((v) => v.label === size.label)
        const merged = {
          ...(idx >= 0 ? mergedVariants[idx] : {}),
          label: size.label,
          priceModifier,
          recommended: Boolean(size.badge?.trim()),
        }
        if (idx >= 0) mergedVariants[idx] = merged
        else mergedVariants.push(merged)
      }

      await payload.update({
        collection: 'products',
        id: product.id,
        data: { variants: mergedVariants },
        req,
      })
    }
  }

  await db.execute(sql`
   ALTER TABLE "subscription_pricing_sizes" DROP COLUMN "price";
  ALTER TABLE "subscription_pricing_sizes" DROP COLUMN "badge";
  ALTER TABLE "subscription_pricing_sizes" DROP COLUMN "active";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "subscription_pricing_sizes" ADD COLUMN "price" numeric NOT NULL DEFAULT 0;
  ALTER TABLE "subscription_pricing_sizes" ADD COLUMN "badge" varchar;
  ALTER TABLE "subscription_pricing_sizes" ADD COLUMN "active" boolean DEFAULT true;
  ALTER TABLE "subscription_pricing_sizes" ALTER COLUMN "price" DROP DEFAULT;`)
}
