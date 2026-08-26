import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_wedding_page_steps_icon" AS ENUM('truck', 'vase', 'pause', 'flower', 'home', 'sparkle');
  CREATE TABLE "wedding_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_wedding_page_steps_icon" NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar
  );
  
  ALTER TABLE "wedding_page" ALTER COLUMN "heading" SET DEFAULT 'Квіти, які не зав''януть після весілля';
  ALTER TABLE "wedding_page" ADD COLUMN "subheading" varchar DEFAULT 'Створіть весільний фонд квітів разом із гостями та отримуйте свіжі букети щотижня протягом року.';
  ALTER TABLE "wedding_page" ADD COLUMN "cta_label" varchar DEFAULT 'Залишити заявку';
  ALTER TABLE "wedding_page" ADD COLUMN "form_heading" varchar DEFAULT 'Плануєте весілля? Давайте зафіксуємо дату';
  ALTER TABLE "wedding_page_steps" ADD CONSTRAINT "wedding_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wedding_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "wedding_page_steps_order_idx" ON "wedding_page_steps" USING btree ("_order");
  CREATE INDEX "wedding_page_steps_parent_id_idx" ON "wedding_page_steps" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "wedding_page_steps" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "wedding_page_steps" CASCADE;
  ALTER TABLE "wedding_page" ALTER COLUMN "heading" SET DEFAULT 'Квіткове оформлення весілля';
  ALTER TABLE "wedding_page" DROP COLUMN "subheading";
  ALTER TABLE "wedding_page" DROP COLUMN "cta_label";
  ALTER TABLE "wedding_page" DROP COLUMN "form_heading";
  DROP TYPE "public"."enum_wedding_page_steps_icon";`)
}
