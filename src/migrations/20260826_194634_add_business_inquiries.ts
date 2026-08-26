import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_business_inquiries_business_type" AS ENUM('restaurant', 'hotel', 'beauty', 'it_office', 'showroom', 'other');
  CREATE TYPE "public"."enum_business_inquiries_status" AS ENUM('new', 'contacted', 'trial_week', 'won', 'lost');
  CREATE TABLE "business_inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar NOT NULL,
  	"contact_person" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"business_type" "enum_business_inquiries_business_type" NOT NULL,
  	"budget_or_locations" varchar,
  	"status" "enum_business_inquiries_status" DEFAULT 'new' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "business_inquiries_id" integer;
  CREATE INDEX "business_inquiries_updated_at_idx" ON "business_inquiries" USING btree ("updated_at");
  CREATE INDEX "business_inquiries_created_at_idx" ON "business_inquiries" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_business_inquiries_fk" FOREIGN KEY ("business_inquiries_id") REFERENCES "public"."business_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_business_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("business_inquiries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "business_inquiries" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "business_inquiries" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_business_inquiries_fk";
  
  DROP INDEX "payload_locked_documents_rels_business_inquiries_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "business_inquiries_id";
  DROP TYPE "public"."enum_business_inquiries_business_type";
  DROP TYPE "public"."enum_business_inquiries_status";`)
}
