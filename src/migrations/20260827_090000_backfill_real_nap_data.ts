import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Data migration: contact_phone/showroom_address were seeded with obvious
// placeholder values ('+380000000000', 'вул. Хрещатик, 1' — a landmark
// address, not the real showroom). Backfills the real NAP (Name-Address-
// Phone) data so Organization/LocalBusiness JSON-LD and on-page contact
// info are accurate — inconsistent NAP actively hurts local SEO. Scoped to
// the known placeholder so it's a no-op if someone already fixed it via
// the admin UI.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET "contact_phone" = '+380954782806'
    WHERE "contact_phone" = '+380000000000';

    UPDATE "site_settings"
    SET "showroom_address" = 'м. Київ, вул. Нагірна, 18/16'
    WHERE "showroom_address" = 'м. Київ, вул. Хрещатик, 1';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET "contact_phone" = '+380000000000'
    WHERE "contact_phone" = '+380954782806';

    UPDATE "site_settings"
    SET "showroom_address" = 'м. Київ, вул. Хрещатик, 1'
    WHERE "showroom_address" = 'м. Київ, вул. Нагірна, 18/16';
  `)
}
