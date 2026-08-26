import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Pure data migration: the rebrand session updated several field *defaults*
// in code, but Payload only applies a new defaultValue to new documents/rows
// — it never rewrites a value already stored in an existing row. Those fixes
// were only ever applied by hand to the local dev DB, so this backfills the
// same content on any environment (e.g. production) that ran the earlier
// schema migrations but still has the pre-rebrand values. Every UPDATE is
// scoped to the known old value so it's a no-op if someone already edited
// the field via the admin UI.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "formats_section_cards"
    SET "button_label" = 'Дізнатись більше', "button_href" = '/dlya-biznesu'
    WHERE "title" = 'ДЛЯ БІЗНЕСУ ТА ОФІСІВ' AND "button_href" = '/business';

    UPDATE "wedding_page"
    SET "heading" = 'Квіти, які не зав''януть після весілля'
    WHERE "heading" = 'Квіткове оформлення весілля';

    UPDATE "site_settings"
    SET "tiktok_url" = 'https://www.tiktok.com/@kvitkovapovnya?_r=1&_t=ZM-91DshVvkvt2'
    WHERE "tiktok_url" = 'https://www.tiktok.com/@kvitkovapovnya';
  `)

  await db.execute(sql`
    DO $$
    DECLARE
      wp_id integer;
      step_count integer;
    BEGIN
      SELECT "id" INTO wp_id FROM "wedding_page" LIMIT 1;
      IF wp_id IS NOT NULL THEN
        SELECT count(*) INTO step_count FROM "wedding_page_steps" WHERE "_parent_id" = wp_id;
        IF step_count = 0 THEN
          INSERT INTO "wedding_page_steps" ("_order", "_parent_id", "id", "icon", "title", "subtitle") VALUES
            (1, wp_id, md5(random()::text || clock_timestamp()::text), 'sparkle', 'Реєстрація весілля', 'Ми створюємо банку Monobank та онлайн-картку з QR для гостей'),
            (2, wp_id, md5(random()::text || clock_timestamp()::text), 'flower', 'Гості донатять на квіти', 'Гості закидають суму на букет і залишають привітання'),
            (3, wp_id, md5(random()::text || clock_timestamp()::text), 'home', 'Рік краси у вашому домі', 'Щотижня ви отримуєте букет із теплими словами від гостя');
        END IF;
      END IF;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "formats_section_cards"
    SET "button_label" = 'Запросити КП', "button_href" = '/business'
    WHERE "title" = 'ДЛЯ БІЗНЕСУ ТА ОФІСІВ' AND "button_href" = '/dlya-biznesu';

    UPDATE "wedding_page"
    SET "heading" = 'Квіткове оформлення весілля'
    WHERE "heading" = 'Квіти, які не зав''януть після весілля';

    UPDATE "site_settings"
    SET "tiktok_url" = 'https://www.tiktok.com/@kvitkovapovnya'
    WHERE "tiktok_url" = 'https://www.tiktok.com/@kvitkovapovnya?_r=1&_t=ZM-91DshVvkvt2';

    DELETE FROM "wedding_page_steps"
    WHERE "title" IN ('Реєстрація весілля', 'Гості донатять на квіти', 'Рік краси у вашому домі');
  `)
}
