import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_design_theme" AS ENUM('old', 'new');
  ALTER TABLE "site_settings" ADD COLUMN "design_theme" "enum_site_settings_design_theme" DEFAULT 'old';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "design_theme";
  DROP TYPE "public"."enum_site_settings_design_theme";`)
}
