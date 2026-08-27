import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feature_strip" ALTER COLUMN "cta_href" SET DEFAULT '/#pidpyska-configurator';
  ALTER TABLE "site_settings" ADD COLUMN "threads_url" varchar DEFAULT 'https://www.threads.com/@kvitkova.povnya';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feature_strip" ALTER COLUMN "cta_href" SET DEFAULT '/katalog';
  ALTER TABLE "site_settings" DROP COLUMN "threads_url";`)
}
