import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_orders_delivery_time_window" ADD VALUE '10:00-14:00' BEFORE '12:00-15:00';
  ALTER TYPE "public"."enum_orders_delivery_time_window" ADD VALUE '14:00-18:00' BEFORE '15:00-18:00';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ALTER COLUMN "delivery_time_window" SET DATA TYPE text;
  DROP TYPE "public"."enum_orders_delivery_time_window";
  CREATE TYPE "public"."enum_orders_delivery_time_window" AS ENUM('09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00');
  ALTER TABLE "orders" ALTER COLUMN "delivery_time_window" SET DATA TYPE "public"."enum_orders_delivery_time_window" USING "delivery_time_window"::"public"."enum_orders_delivery_time_window";`)
}
