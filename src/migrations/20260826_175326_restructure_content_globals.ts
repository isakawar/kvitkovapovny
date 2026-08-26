import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"google_rating" varchar DEFAULT '5.0',
  	"happy_subscribers_stat" varchar DEFAULT '1000+ щасливих власників підписок',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  CREATE TABLE "testimonials_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"author_name" varchar
  );
  CREATE TABLE "faq_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  CREATE TABLE "faq_section_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0
  );
  CREATE TABLE "instagram_integration_instagram_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"link" varchar
  );
  ALTER TABLE "testimonials_testimonials" ADD CONSTRAINT "testimonials_testimonials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_testimonials" ADD CONSTRAINT "testimonials_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_section_faq_items" ADD CONSTRAINT "faq_section_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instagram_integration_instagram_posts" ADD CONSTRAINT "instagram_integration_instagram_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instagram_integration_instagram_posts" ADD CONSTRAINT "instagram_integration_instagram_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instagram_integration"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "testimonials_testimonials_order_idx" ON "testimonials_testimonials" USING btree ("_order");
  CREATE INDEX "testimonials_testimonials_parent_id_idx" ON "testimonials_testimonials" USING btree ("_parent_id");
  CREATE INDEX "testimonials_testimonials_image_idx" ON "testimonials_testimonials" USING btree ("image_id");
  CREATE INDEX "faq_section_faq_items_order_idx" ON "faq_section_faq_items" USING btree ("_order");
  CREATE INDEX "faq_section_faq_items_parent_id_idx" ON "faq_section_faq_items" USING btree ("_parent_id");
  CREATE INDEX "instagram_integration_instagram_posts_order_idx" ON "instagram_integration_instagram_posts" USING btree ("_order");
  CREATE INDEX "instagram_integration_instagram_posts_parent_id_idx" ON "instagram_integration_instagram_posts" USING btree ("_parent_id");
  CREATE INDEX "instagram_integration_instagram_posts_image_idx" ON "instagram_integration_instagram_posts" USING btree ("image_id");`)

  // Data migration: copy the existing "site_settings" testimonials/FAQ/Instagram-posts
  // content (and the instagram_integration singleton row, created here if it never
  // existed) into the new tables before the old columns/tables are dropped below —
  // this is real seeded/editorial content, not disposable schema.
  await db.execute(sql`
   DO $$
  DECLARE
    new_testimonials_id integer;
    new_faq_id integer;
    ig_id integer;
  BEGIN
    INSERT INTO "testimonials" ("google_rating", "happy_subscribers_stat", "created_at", "updated_at")
      SELECT "google_rating", "happy_subscribers_stat", "created_at", "updated_at" FROM "site_settings" LIMIT 1
      RETURNING "id" INTO new_testimonials_id;
    IF new_testimonials_id IS NOT NULL THEN
      INSERT INTO "testimonials_testimonials" ("_order", "_parent_id", "id", "image_id", "author_name")
        SELECT "_order", new_testimonials_id, "id", "image_id", "author_name" FROM "site_settings_testimonials";
    END IF;

    INSERT INTO "faq_section" ("created_at", "updated_at")
      SELECT "created_at", "updated_at" FROM "site_settings" LIMIT 1
      RETURNING "id" INTO new_faq_id;
    IF new_faq_id IS NOT NULL THEN
      INSERT INTO "faq_section_faq_items" ("_order", "_parent_id", "id", "question", "answer", "sort_order")
        SELECT "_order", new_faq_id, "id", "question", "answer", "sort_order" FROM "site_settings_faq_items";
    END IF;

    SELECT "id" INTO ig_id FROM "instagram_integration" LIMIT 1;
    IF ig_id IS NULL THEN
      INSERT INTO "instagram_integration" ("post_limit", "created_at", "updated_at")
        VALUES (12, now(), now()) RETURNING "id" INTO ig_id;
    END IF;
    INSERT INTO "instagram_integration_instagram_posts" ("_order", "_parent_id", "id", "image_id", "link")
      SELECT "_order", ig_id, "id", "image_id", "link" FROM "site_settings_instagram_posts";
  END $$;`)

  await db.execute(sql`
   DROP TABLE "site_settings_testimonials" CASCADE;
  DROP TABLE "site_settings_faq_items" CASCADE;
  DROP TABLE "site_settings_instagram_posts" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "google_rating";
  ALTER TABLE "site_settings" DROP COLUMN "happy_subscribers_stat";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "google_rating" varchar DEFAULT '5.0';
  ALTER TABLE "site_settings" ADD COLUMN "happy_subscribers_stat" varchar DEFAULT '1000+ щасливих власників підписок';
  CREATE TABLE "site_settings_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"author_name" varchar
  );
  CREATE TABLE "site_settings_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0
  );
  CREATE TABLE "site_settings_instagram_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"link" varchar
  );
  ALTER TABLE "site_settings_testimonials" ADD CONSTRAINT "site_settings_testimonials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_testimonials" ADD CONSTRAINT "site_settings_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_faq_items" ADD CONSTRAINT "site_settings_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_instagram_posts" ADD CONSTRAINT "site_settings_instagram_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_instagram_posts" ADD CONSTRAINT "site_settings_instagram_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_testimonials_order_idx" ON "site_settings_testimonials" USING btree ("_order");
  CREATE INDEX "site_settings_testimonials_parent_id_idx" ON "site_settings_testimonials" USING btree ("_parent_id");
  CREATE INDEX "site_settings_testimonials_image_idx" ON "site_settings_testimonials" USING btree ("image_id");
  CREATE INDEX "site_settings_faq_items_order_idx" ON "site_settings_faq_items" USING btree ("_order");
  CREATE INDEX "site_settings_faq_items_parent_id_idx" ON "site_settings_faq_items" USING btree ("_parent_id");
  CREATE INDEX "site_settings_instagram_posts_order_idx" ON "site_settings_instagram_posts" USING btree ("_order");
  CREATE INDEX "site_settings_instagram_posts_parent_id_idx" ON "site_settings_instagram_posts" USING btree ("_parent_id");
  CREATE INDEX "site_settings_instagram_posts_image_idx" ON "site_settings_instagram_posts" USING btree ("image_id");`)

  await db.execute(sql`
   DO $$
  DECLARE
    site_settings_id integer;
  BEGIN
    SELECT "id" INTO site_settings_id FROM "site_settings" LIMIT 1;
    IF site_settings_id IS NOT NULL THEN
      UPDATE "site_settings" SET
        "google_rating" = (SELECT "google_rating" FROM "testimonials" LIMIT 1),
        "happy_subscribers_stat" = (SELECT "happy_subscribers_stat" FROM "testimonials" LIMIT 1)
      WHERE "id" = site_settings_id;

      INSERT INTO "site_settings_testimonials" ("_order", "_parent_id", "id", "image_id", "author_name")
        SELECT "_order", site_settings_id, "id", "image_id", "author_name" FROM "testimonials_testimonials";

      INSERT INTO "site_settings_faq_items" ("_order", "_parent_id", "id", "question", "answer", "sort_order")
        SELECT "_order", site_settings_id, "id", "question", "answer", "sort_order" FROM "faq_section_faq_items";

      INSERT INTO "site_settings_instagram_posts" ("_order", "_parent_id", "id", "image_id", "link")
        SELECT "_order", site_settings_id, "id", "image_id", "link" FROM "instagram_integration_instagram_posts";
    END IF;
  END $$;`)

  await db.execute(sql`
   DROP TABLE "instagram_integration_instagram_posts" CASCADE;
  DROP TABLE "testimonials_testimonials" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "faq_section_faq_items" CASCADE;
  DROP TABLE "faq_section" CASCADE;`)
}
