import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "cart_gift_note" varchar;`)

  // Preserve the previously hard-coded banner text on existing installs.
  await db.execute(sql`
   UPDATE "site_settings"
   SET "cart_gift_note" = '🎁 До вашого замовлення додано: Ваза та секатор у ПОДАРУНОК'
   WHERE "cart_gift_note" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "cart_gift_note";`)
}
