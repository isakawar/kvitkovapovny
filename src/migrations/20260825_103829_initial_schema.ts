import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'florist');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_products_audience_tags" AS ENUM('home', 'business', 'trial');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_audience_tags" AS ENUM('home', 'business', 'trial');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_orders_delivery_method" AS ENUM('courier', 'nova_poshta', 'pickup');
  CREATE TYPE "public"."enum_orders_delivery_time_window" AS ENUM('09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('online', 'installments', 'business_invoice');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('new', 'confirmed', 'in_progress', 'done', 'cancelled');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('not_required', 'pending', 'paid', 'failed', 'refunded');
  CREATE TYPE "public"."enum_orders_payment_provider" AS ENUM('none', 'monobank_acquiring', 'monobank_installments');
  CREATE TYPE "public"."enum_wedding_inquiries_status" AS ENUM('new', 'contacted', 'consultation_scheduled', 'won', 'lost');
  CREATE TYPE "public"."enum_hero_cta_buttons_style" AS ENUM('primary', 'secondary');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'florist' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_full_url" varchar,
  	"sizes_full_width" numeric,
  	"sizes_full_height" numeric,
  	"sizes_full_mime_type" varchar,
  	"sizes_full_filesize" numeric,
  	"sizes_full_filename" varchar
  );
  
  CREATE TABLE "categories_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_categories_v_version_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "products_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar
  );
  
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"price_modifier" numeric DEFAULT 0,
  	"image_id" integer,
  	"sku" varchar,
  	"recommended" boolean DEFAULT false
  );
  
  CREATE TABLE "products_delivery_frequencies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "products_delivery_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "products_trust_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "products_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "products_audience_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_audience_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"pdp_heading" varchar,
  	"slug" varchar,
  	"price" numeric,
  	"description" jsonb,
  	"badge" varchar,
  	"price_suffix_label" varchar,
  	"cta_label" varchar,
  	"highlighted" boolean DEFAULT false,
  	"cross_sell" boolean DEFAULT false,
  	"in_stock" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "_products_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"price_modifier" numeric DEFAULT 0,
  	"image_id" integer,
  	"sku" varchar,
  	"recommended" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_delivery_frequencies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_delivery_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_trust_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_audience_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_audience_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_pdp_heading" varchar,
  	"version_slug" varchar,
  	"version_price" numeric,
  	"version_description" jsonb,
  	"version_badge" varchar,
  	"version_price_suffix_label" varchar,
  	"version_cta_label" varchar,
  	"version_highlighted" boolean DEFAULT false,
  	"version_cross_sell" boolean DEFAULT false,
  	"version_in_stock" boolean DEFAULT true,
  	"version_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"product_name" varchar NOT NULL,
  	"variant_label" varchar,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"line_total" numeric NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"is_gift" boolean DEFAULT false,
  	"recipient_name" varchar,
  	"recipient_phone" varchar,
  	"gift_surprise" boolean DEFAULT false,
  	"delivery_method" "enum_orders_delivery_method" DEFAULT 'courier' NOT NULL,
  	"delivery_city" varchar,
  	"delivery_date" timestamp(3) with time zone NOT NULL,
  	"delivery_address" varchar,
  	"delivery_time_window" "enum_orders_delivery_time_window",
  	"np_office_number" varchar,
  	"np_city_ref" varchar,
  	"np_warehouse_ref" varchar,
  	"pickup_time" varchar,
  	"card_message" varchar,
  	"payment_method" "enum_orders_payment_method" DEFAULT 'online' NOT NULL,
  	"comment" varchar,
  	"order_total" numeric,
  	"status" "enum_orders_status" DEFAULT 'new' NOT NULL,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'not_required',
  	"payment_provider" "enum_orders_payment_provider" DEFAULT 'none',
  	"payment_reference" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wedding_inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"wedding_date" timestamp(3) with time zone,
  	"guests_count" numeric,
  	"budget" varchar,
  	"comment" varchar,
  	"status" "enum_wedding_inquiries_status" DEFAULT 'new' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"products_id" integer,
  	"orders_id" integer,
  	"wedding_inquiries_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hero_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"style" "enum_hero_cta_buttons_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'СВІЖІ КВІТИ У ВАШОМУ ДОМІ ЩОТИЖНЯ' NOT NULL,
  	"subheading" varchar DEFAULT 'Спеціальна ваза та флористичний секатор у подарунок до першої підписки',
  	"video_id" integer,
  	"fallback_image_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_instagram_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"link" varchar
  );
  
  CREATE TABLE "site_settings_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"author_name" varchar
  );
  
  CREATE TABLE "site_settings_delivery_cities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "site_settings_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"contact_phone" varchar,
  	"contact_email" varchar,
  	"instagram_url" varchar,
  	"showroom_address" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "subscription_info_frequencies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "subscription_info_minimum_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "subscription_info_each_delivery_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "subscription_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ticker_text" varchar DEFAULT '★ Безкоштовна доставка по Києву ★ Ваза та ножиці у подарунок ★ Можливість паузи підписки',
  	"heading" varchar DEFAULT 'Що таке підписка на квіти?' NOT NULL,
  	"intro" varchar DEFAULT 'Підписка на квіти - це регулярна доставка найсвіжіших квіткових композицій з сезонних та екзотичних квітів, прямо до дверей, щоб у домі або офісі завжди була краса та настрій.
  
  Вам достатньо обрати частоту доставок та розмір композиції і вже скоро ваша квіткова підписка прямуватиме до вас.' NOT NULL,
  	"image_id" integer,
  	"frequencies_heading" varchar DEFAULT 'Ми пропонуємо 3 частоти доставок:',
  	"minimum_heading" varchar DEFAULT 'Мінімальна підписка включає:',
  	"each_delivery_heading" varchar DEFAULT 'Кожна доставка включає:',
  	"cta_label" varchar DEFAULT 'Задати питання',
  	"cta_href" varchar DEFAULT '/contacts',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "wedding_page_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "wedding_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Квіткове оформлення весілля' NOT NULL,
  	"intro" varchar DEFAULT 'Розробляємо індивідуальне квіткове оформлення під ваше весілля: арки, композиції на столи, букет нареченої, бутоньєрки. Кожен проєкт — окремий розрахунок під бюджет і стилістику свята.' NOT NULL,
  	"cover_image_id" integer,
  	"contact_note" varchar DEFAULT 'Залиште заявку — зв''яжемось для безкоштовної консультації протягом дня.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "formats_section_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar NOT NULL,
  	"button_label" varchar NOT NULL,
  	"button_href" varchar NOT NULL,
  	"image_id" integer,
  	"sort_order" numeric DEFAULT 0
  );
  
  CREATE TABLE "formats_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "instagram_integration" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar,
  	"ig_user_id" varchar,
  	"post_limit" numeric DEFAULT 12,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_faq_items" ADD CONSTRAINT "categories_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_version_faq_items" ADD CONSTRAINT "_categories_v_version_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_delivery_frequencies" ADD CONSTRAINT "products_delivery_frequencies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_delivery_days" ADD CONSTRAINT "products_delivery_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_trust_badges" ADD CONSTRAINT "products_trust_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_bullets" ADD CONSTRAINT "products_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_audience_tags" ADD CONSTRAINT "products_audience_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_delivery_frequencies" ADD CONSTRAINT "_products_v_version_delivery_frequencies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_delivery_days" ADD CONSTRAINT "_products_v_version_delivery_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_trust_badges" ADD CONSTRAINT "_products_v_version_trust_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_bullets" ADD CONSTRAINT "_products_v_version_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_audience_tags" ADD CONSTRAINT "_products_v_version_audience_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wedding_inquiries_fk" FOREIGN KEY ("wedding_inquiries_id") REFERENCES "public"."wedding_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_cta_buttons" ADD CONSTRAINT "hero_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero" ADD CONSTRAINT "hero_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero" ADD CONSTRAINT "hero_fallback_image_id_media_id_fk" FOREIGN KEY ("fallback_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_instagram_posts" ADD CONSTRAINT "site_settings_instagram_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_instagram_posts" ADD CONSTRAINT "site_settings_instagram_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_testimonials" ADD CONSTRAINT "site_settings_testimonials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_testimonials" ADD CONSTRAINT "site_settings_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_delivery_cities" ADD CONSTRAINT "site_settings_delivery_cities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_faq_items" ADD CONSTRAINT "site_settings_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscription_info_frequencies" ADD CONSTRAINT "subscription_info_frequencies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subscription_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscription_info_minimum_includes" ADD CONSTRAINT "subscription_info_minimum_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subscription_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscription_info_each_delivery_includes" ADD CONSTRAINT "subscription_info_each_delivery_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subscription_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscription_info" ADD CONSTRAINT "subscription_info_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wedding_page_gallery" ADD CONSTRAINT "wedding_page_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wedding_page_gallery" ADD CONSTRAINT "wedding_page_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wedding_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_page" ADD CONSTRAINT "wedding_page_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "formats_section_cards" ADD CONSTRAINT "formats_section_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "formats_section_cards" ADD CONSTRAINT "formats_section_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."formats_section"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_full_sizes_full_filename_idx" ON "media" USING btree ("sizes_full_filename");
  CREATE INDEX "categories_faq_items_order_idx" ON "categories_faq_items" USING btree ("_order");
  CREATE INDEX "categories_faq_items_parent_id_idx" ON "categories_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories__status_idx" ON "categories" USING btree ("_status");
  CREATE INDEX "_categories_v_version_faq_items_order_idx" ON "_categories_v_version_faq_items" USING btree ("_order");
  CREATE INDEX "_categories_v_version_faq_items_parent_id_idx" ON "_categories_v_version_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_image_idx" ON "_categories_v" USING btree ("version_image_id");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_version_version__status_idx" ON "_categories_v" USING btree ("version__status");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_categories_v_latest_idx" ON "_categories_v" USING btree ("latest");
  CREATE INDEX "products_images_order_idx" ON "products_images" USING btree ("_order");
  CREATE INDEX "products_images_parent_id_idx" ON "products_images" USING btree ("_parent_id");
  CREATE INDEX "products_images_image_idx" ON "products_images" USING btree ("image_id");
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE INDEX "products_variants_image_idx" ON "products_variants" USING btree ("image_id");
  CREATE INDEX "products_delivery_frequencies_order_idx" ON "products_delivery_frequencies" USING btree ("_order");
  CREATE INDEX "products_delivery_frequencies_parent_id_idx" ON "products_delivery_frequencies" USING btree ("_parent_id");
  CREATE INDEX "products_delivery_days_order_idx" ON "products_delivery_days" USING btree ("_order");
  CREATE INDEX "products_delivery_days_parent_id_idx" ON "products_delivery_days" USING btree ("_parent_id");
  CREATE INDEX "products_trust_badges_order_idx" ON "products_trust_badges" USING btree ("_order");
  CREATE INDEX "products_trust_badges_parent_id_idx" ON "products_trust_badges" USING btree ("_parent_id");
  CREATE INDEX "products_bullets_order_idx" ON "products_bullets" USING btree ("_order");
  CREATE INDEX "products_bullets_parent_id_idx" ON "products_bullets" USING btree ("_parent_id");
  CREATE INDEX "products_audience_tags_order_idx" ON "products_audience_tags" USING btree ("order");
  CREATE INDEX "products_audience_tags_parent_idx" ON "products_audience_tags" USING btree ("parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");
  CREATE INDEX "_products_v_version_images_order_idx" ON "_products_v_version_images" USING btree ("_order");
  CREATE INDEX "_products_v_version_images_parent_id_idx" ON "_products_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_images_image_idx" ON "_products_v_version_images" USING btree ("image_id");
  CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_variants_image_idx" ON "_products_v_version_variants" USING btree ("image_id");
  CREATE INDEX "_products_v_version_delivery_frequencies_order_idx" ON "_products_v_version_delivery_frequencies" USING btree ("_order");
  CREATE INDEX "_products_v_version_delivery_frequencies_parent_id_idx" ON "_products_v_version_delivery_frequencies" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_delivery_days_order_idx" ON "_products_v_version_delivery_days" USING btree ("_order");
  CREATE INDEX "_products_v_version_delivery_days_parent_id_idx" ON "_products_v_version_delivery_days" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_trust_badges_order_idx" ON "_products_v_version_trust_badges" USING btree ("_order");
  CREATE INDEX "_products_v_version_trust_badges_parent_id_idx" ON "_products_v_version_trust_badges" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_bullets_order_idx" ON "_products_v_version_bullets" USING btree ("_order");
  CREATE INDEX "_products_v_version_bullets_parent_id_idx" ON "_products_v_version_bullets" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_audience_tags_order_idx" ON "_products_v_version_audience_tags" USING btree ("order");
  CREATE INDEX "_products_v_version_audience_tags_parent_idx" ON "_products_v_version_audience_tags" USING btree ("parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "wedding_inquiries_updated_at_idx" ON "wedding_inquiries" USING btree ("updated_at");
  CREATE INDEX "wedding_inquiries_created_at_idx" ON "wedding_inquiries" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_wedding_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("wedding_inquiries_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "hero_cta_buttons_order_idx" ON "hero_cta_buttons" USING btree ("_order");
  CREATE INDEX "hero_cta_buttons_parent_id_idx" ON "hero_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "hero_video_idx" ON "hero" USING btree ("video_id");
  CREATE INDEX "hero_fallback_image_idx" ON "hero" USING btree ("fallback_image_id");
  CREATE INDEX "site_settings_instagram_posts_order_idx" ON "site_settings_instagram_posts" USING btree ("_order");
  CREATE INDEX "site_settings_instagram_posts_parent_id_idx" ON "site_settings_instagram_posts" USING btree ("_parent_id");
  CREATE INDEX "site_settings_instagram_posts_image_idx" ON "site_settings_instagram_posts" USING btree ("image_id");
  CREATE INDEX "site_settings_testimonials_order_idx" ON "site_settings_testimonials" USING btree ("_order");
  CREATE INDEX "site_settings_testimonials_parent_id_idx" ON "site_settings_testimonials" USING btree ("_parent_id");
  CREATE INDEX "site_settings_testimonials_image_idx" ON "site_settings_testimonials" USING btree ("image_id");
  CREATE INDEX "site_settings_delivery_cities_order_idx" ON "site_settings_delivery_cities" USING btree ("_order");
  CREATE INDEX "site_settings_delivery_cities_parent_id_idx" ON "site_settings_delivery_cities" USING btree ("_parent_id");
  CREATE INDEX "site_settings_faq_items_order_idx" ON "site_settings_faq_items" USING btree ("_order");
  CREATE INDEX "site_settings_faq_items_parent_id_idx" ON "site_settings_faq_items" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "subscription_info_frequencies_order_idx" ON "subscription_info_frequencies" USING btree ("_order");
  CREATE INDEX "subscription_info_frequencies_parent_id_idx" ON "subscription_info_frequencies" USING btree ("_parent_id");
  CREATE INDEX "subscription_info_minimum_includes_order_idx" ON "subscription_info_minimum_includes" USING btree ("_order");
  CREATE INDEX "subscription_info_minimum_includes_parent_id_idx" ON "subscription_info_minimum_includes" USING btree ("_parent_id");
  CREATE INDEX "subscription_info_each_delivery_includes_order_idx" ON "subscription_info_each_delivery_includes" USING btree ("_order");
  CREATE INDEX "subscription_info_each_delivery_includes_parent_id_idx" ON "subscription_info_each_delivery_includes" USING btree ("_parent_id");
  CREATE INDEX "subscription_info_image_idx" ON "subscription_info" USING btree ("image_id");
  CREATE INDEX "wedding_page_gallery_order_idx" ON "wedding_page_gallery" USING btree ("_order");
  CREATE INDEX "wedding_page_gallery_parent_id_idx" ON "wedding_page_gallery" USING btree ("_parent_id");
  CREATE INDEX "wedding_page_gallery_image_idx" ON "wedding_page_gallery" USING btree ("image_id");
  CREATE INDEX "wedding_page_cover_image_idx" ON "wedding_page" USING btree ("cover_image_id");
  CREATE INDEX "formats_section_cards_order_idx" ON "formats_section_cards" USING btree ("_order");
  CREATE INDEX "formats_section_cards_parent_id_idx" ON "formats_section_cards" USING btree ("_parent_id");
  CREATE INDEX "formats_section_cards_image_idx" ON "formats_section_cards" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories_faq_items" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "_categories_v_version_faq_items" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "products_images" CASCADE;
  DROP TABLE "products_variants" CASCADE;
  DROP TABLE "products_delivery_frequencies" CASCADE;
  DROP TABLE "products_delivery_days" CASCADE;
  DROP TABLE "products_trust_badges" CASCADE;
  DROP TABLE "products_bullets" CASCADE;
  DROP TABLE "products_audience_tags" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_images" CASCADE;
  DROP TABLE "_products_v_version_variants" CASCADE;
  DROP TABLE "_products_v_version_delivery_frequencies" CASCADE;
  DROP TABLE "_products_v_version_delivery_days" CASCADE;
  DROP TABLE "_products_v_version_trust_badges" CASCADE;
  DROP TABLE "_products_v_version_bullets" CASCADE;
  DROP TABLE "_products_v_version_audience_tags" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "wedding_inquiries" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "hero_cta_buttons" CASCADE;
  DROP TABLE "hero" CASCADE;
  DROP TABLE "site_settings_instagram_posts" CASCADE;
  DROP TABLE "site_settings_testimonials" CASCADE;
  DROP TABLE "site_settings_delivery_cities" CASCADE;
  DROP TABLE "site_settings_faq_items" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "subscription_info_frequencies" CASCADE;
  DROP TABLE "subscription_info_minimum_includes" CASCADE;
  DROP TABLE "subscription_info_each_delivery_includes" CASCADE;
  DROP TABLE "subscription_info" CASCADE;
  DROP TABLE "wedding_page_gallery" CASCADE;
  DROP TABLE "wedding_page" CASCADE;
  DROP TABLE "formats_section_cards" CASCADE;
  DROP TABLE "formats_section" CASCADE;
  DROP TABLE "instagram_integration" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum__categories_v_version_status";
  DROP TYPE "public"."enum_products_audience_tags";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_audience_tags";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_orders_delivery_method";
  DROP TYPE "public"."enum_orders_delivery_time_window";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_payment_provider";
  DROP TYPE "public"."enum_wedding_inquiries_status";
  DROP TYPE "public"."enum_hero_cta_buttons_style";`)
}
