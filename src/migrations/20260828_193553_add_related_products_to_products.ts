import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_products_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_products_fk";
  
  ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_products_fk";
  
  DROP INDEX "products_rels_products_id_idx";
  DROP INDEX "_products_v_rels_products_id_idx";
  ALTER TABLE "products_rels" DROP COLUMN "products_id";
  ALTER TABLE "_products_v_rels" DROP COLUMN "products_id";`)
}
