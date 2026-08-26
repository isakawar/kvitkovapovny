import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_custom_bouquet_requests_gamma" AS ENUM('gentle', 'bright', 'classic', 'florist_choice');
  CREATE TYPE "public"."enum_custom_bouquet_requests_status" AS ENUM('new', 'contacted', 'in_progress', 'done', 'cancelled');
  CREATE TABLE "custom_bouquet_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"gamma" "enum_custom_bouquet_requests_gamma" NOT NULL,
  	"budget" numeric NOT NULL,
  	"occasion" varchar,
  	"liked_flowers" varchar,
  	"disliked_flowers" varchar,
  	"card_message" varchar,
  	"reference_photo_id" integer,
  	"status" "enum_custom_bouquet_requests_status" DEFAULT 'new' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "custom_bouquet_requests_id" integer;
  ALTER TABLE "custom_bouquet_requests" ADD CONSTRAINT "custom_bouquet_requests_reference_photo_id_media_id_fk" FOREIGN KEY ("reference_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "custom_bouquet_requests_reference_photo_idx" ON "custom_bouquet_requests" USING btree ("reference_photo_id");
  CREATE INDEX "custom_bouquet_requests_updated_at_idx" ON "custom_bouquet_requests" USING btree ("updated_at");
  CREATE INDEX "custom_bouquet_requests_created_at_idx" ON "custom_bouquet_requests" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_custom_bouquet_requests_fk" FOREIGN KEY ("custom_bouquet_requests_id") REFERENCES "public"."custom_bouquet_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_custom_bouquet_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("custom_bouquet_requests_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "custom_bouquet_requests" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "custom_bouquet_requests" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_custom_bouquet_requests_fk";
  
  DROP INDEX "payload_locked_documents_rels_custom_bouquet_requests_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "custom_bouquet_requests_id";
  DROP TYPE "public"."enum_custom_bouquet_requests_gamma";
  DROP TYPE "public"."enum_custom_bouquet_requests_status";`)
}
