import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "subscription_pricing_sizes_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"alt" varchar,
  	"sort_order" numeric DEFAULT 0
  );
  
  CREATE TABLE "subscription_pricing_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"badge" varchar,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "subscription_pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products" ADD COLUMN "free_delivery_badge" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "vase_gift_badge" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_free_delivery_badge" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_vase_gift_badge" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "google_rating" varchar DEFAULT '5.0';
  ALTER TABLE "site_settings" ADD COLUMN "happy_subscribers_stat" varchar DEFAULT '1000+ щасливих власників підписок';
  ALTER TABLE "subscription_pricing_sizes_images" ADD CONSTRAINT "subscription_pricing_sizes_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscription_pricing_sizes_images" ADD CONSTRAINT "subscription_pricing_sizes_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subscription_pricing_sizes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscription_pricing_sizes" ADD CONSTRAINT "subscription_pricing_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subscription_pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "subscription_pricing_sizes_images_order_idx" ON "subscription_pricing_sizes_images" USING btree ("_order");
  CREATE INDEX "subscription_pricing_sizes_images_parent_id_idx" ON "subscription_pricing_sizes_images" USING btree ("_parent_id");
  CREATE INDEX "subscription_pricing_sizes_images_image_idx" ON "subscription_pricing_sizes_images" USING btree ("image_id");
  CREATE INDEX "subscription_pricing_sizes_order_idx" ON "subscription_pricing_sizes" USING btree ("_order");
  CREATE INDEX "subscription_pricing_sizes_parent_id_idx" ON "subscription_pricing_sizes" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "subscription_pricing_sizes_images" CASCADE;
  DROP TABLE "subscription_pricing_sizes" CASCADE;
  DROP TABLE "subscription_pricing" CASCADE;
  ALTER TABLE "products" DROP COLUMN "free_delivery_badge";
  ALTER TABLE "products" DROP COLUMN "vase_gift_badge";
  ALTER TABLE "_products_v" DROP COLUMN "version_free_delivery_badge";
  ALTER TABLE "_products_v" DROP COLUMN "version_vase_gift_badge";
  ALTER TABLE "site_settings" DROP COLUMN "google_rating";
  ALTER TABLE "site_settings" DROP COLUMN "happy_subscribers_stat";`)
}
