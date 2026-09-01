import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Add the new hasMany relationship columns.
  await db.execute(sql`
  ALTER TABLE "products_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_products_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");`)

  // 2. Copy existing rows from the old array tables into the rels tables,
  //    preserving order. The per-product `alt` override is dropped — alt now
  //    lives on the media item itself.
  await db.execute(sql`
  INSERT INTO "products_rels" ("order", "parent_id", "path", "media_id")
  SELECT "_order", "_parent_id", 'images', "image_id"
  FROM "products_images"
  WHERE "image_id" IS NOT NULL;

  INSERT INTO "_products_v_rels" ("order", "parent_id", "path", "media_id")
  SELECT "_order", "_parent_id", 'version.images', "image_id"
  FROM "_products_v_version_images"
  WHERE "image_id" IS NOT NULL;`)

  // 3. Drop the now-unused array tables.
  await db.execute(sql`
  ALTER TABLE "products_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_images" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_images" CASCADE;
  DROP TABLE "_products_v_version_images" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar
  );
  
  CREATE TABLE "_products_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_media_fk";
  
  ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_media_fk";
  
  DROP INDEX "products_rels_media_id_idx";
  DROP INDEX "_products_v_rels_media_id_idx";
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_images_order_idx" ON "products_images" USING btree ("_order");
  CREATE INDEX "products_images_parent_id_idx" ON "products_images" USING btree ("_parent_id");
  CREATE INDEX "products_images_image_idx" ON "products_images" USING btree ("image_id");
  CREATE INDEX "_products_v_version_images_order_idx" ON "_products_v_version_images" USING btree ("_order");
  CREATE INDEX "_products_v_version_images_parent_id_idx" ON "_products_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_images_image_idx" ON "_products_v_version_images" USING btree ("image_id");

  INSERT INTO "products_images" ("_order", "_parent_id", "id", "image_id")
  SELECT "order", "parent_id", gen_random_uuid()::varchar, "media_id"
  FROM "products_rels"
  WHERE "path" = 'images' AND "media_id" IS NOT NULL;

  INSERT INTO "_products_v_version_images" ("_order", "_parent_id", "image_id")
  SELECT "order", "parent_id", "media_id"
  FROM "_products_v_rels"
  WHERE "path" = 'version.images' AND "media_id" IS NOT NULL;

  DELETE FROM "products_rels" WHERE "path" = 'images';
  DELETE FROM "_products_v_rels" WHERE "path" = 'version.images';

  ALTER TABLE "products_rels" DROP COLUMN "media_id";
  ALTER TABLE "_products_v_rels" DROP COLUMN "media_id";`)
}
