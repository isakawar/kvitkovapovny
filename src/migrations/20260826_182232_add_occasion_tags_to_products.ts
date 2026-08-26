import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_occasion_tags" AS ENUM('birthday', 'romantic', 'gentle');
  CREATE TYPE "public"."enum__products_v_version_occasion_tags" AS ENUM('birthday', 'romantic', 'gentle');
  CREATE TABLE "products_occasion_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_occasion_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_occasion_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_occasion_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "products_occasion_tags" ADD CONSTRAINT "products_occasion_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_occasion_tags" ADD CONSTRAINT "_products_v_version_occasion_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_occasion_tags_order_idx" ON "products_occasion_tags" USING btree ("order");
  CREATE INDEX "products_occasion_tags_parent_idx" ON "products_occasion_tags" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_occasion_tags_order_idx" ON "_products_v_version_occasion_tags" USING btree ("order");
  CREATE INDEX "_products_v_version_occasion_tags_parent_idx" ON "_products_v_version_occasion_tags" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_occasion_tags" CASCADE;
  DROP TABLE "_products_v_version_occasion_tags" CASCADE;
  DROP TYPE "public"."enum_products_occasion_tags";
  DROP TYPE "public"."enum__products_v_version_occasion_tags";`)
}
