import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feature_strip_items_icon" AS ENUM('truck', 'vase', 'pause', 'flower', 'home', 'sparkle');
  CREATE TYPE "public"."enum_how_it_works_section_steps_icon" AS ENUM('truck', 'vase', 'pause', 'flower', 'home', 'sparkle');
  CREATE TABLE "feature_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_feature_strip_items_icon" NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar
  );
  
  CREATE TABLE "feature_strip" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "how_it_works_section_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_how_it_works_section_steps_icon" NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar
  );
  
  CREATE TABLE "how_it_works_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Як це працює' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "feature_strip_items" ADD CONSTRAINT "feature_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feature_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "how_it_works_section_steps" ADD CONSTRAINT "how_it_works_section_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."how_it_works_section"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "feature_strip_items_order_idx" ON "feature_strip_items" USING btree ("_order");
  CREATE INDEX "feature_strip_items_parent_id_idx" ON "feature_strip_items" USING btree ("_parent_id");
  CREATE INDEX "how_it_works_section_steps_order_idx" ON "how_it_works_section_steps" USING btree ("_order");
  CREATE INDEX "how_it_works_section_steps_parent_id_idx" ON "how_it_works_section_steps" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "feature_strip_items" CASCADE;
  DROP TABLE "feature_strip" CASCADE;
  DROP TABLE "how_it_works_section_steps" CASCADE;
  DROP TABLE "how_it_works_section" CASCADE;
  DROP TYPE "public"."enum_feature_strip_items_icon";
  DROP TYPE "public"."enum_how_it_works_section_steps_icon";`)
}
