import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "formats_section" ADD COLUMN "heading" varchar DEFAULT 'Наші послуги';
  ALTER TABLE "feature_strip_items" ADD COLUMN "description" varchar;
  ALTER TABLE "feature_strip" ADD COLUMN "heading" varchar DEFAULT 'Квіткові підписки та доставка по Києву';
  ALTER TABLE "feature_strip" ADD COLUMN "cta_label" varchar DEFAULT 'ОБРАТИ ПЛАН ПІДПИСКИ';
  ALTER TABLE "feature_strip" ADD COLUMN "cta_href" varchar DEFAULT '/katalog';
  ALTER TABLE "feature_strip_items" DROP COLUMN "subtitle";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feature_strip_items" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "formats_section" DROP COLUMN "heading";
  ALTER TABLE "feature_strip_items" DROP COLUMN "description";
  ALTER TABLE "feature_strip" DROP COLUMN "heading";
  ALTER TABLE "feature_strip" DROP COLUMN "cta_label";
  ALTER TABLE "feature_strip" DROP COLUMN "cta_href";`)
}
