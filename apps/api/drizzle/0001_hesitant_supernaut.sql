DO $$ BEGIN
 CREATE TYPE "review_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "delivery_provider_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "delivery_type" AS ENUM('STANDARD', 'EXPRESS', 'SAME_DAY', 'PICKUP');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "notification_channel" AS ENUM('IN_APP', 'EMAIL', 'PUSH', 'SMS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "notification_type" AS ENUM('ORDER_UPDATE', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PRODUCT_APPROVED', 'PRODUCT_REJECTED', 'REVIEW_RECEIVED', 'MESSAGE_RECEIVED', 'WALLET_DEPOSIT', 'WALLET_WITHDRAWAL', 'PROMOTION_AVAILABLE', 'SYSTEM_ANNOUNCEMENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_reports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"review_id" uuid NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reason" varchar(100) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_votes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_helpful" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(200),
	"comment" text,
	"images" text,
	"is_verified_purchase" boolean DEFAULT true NOT NULL,
	"status" "review_status" DEFAULT 'PENDING' NOT NULL,
	"seller_response" text,
	"seller_response_at" timestamp,
	"moderator_id" uuid,
	"moderated_at" timestamp,
	"moderation_reason" text,
	"helpful_votes" integer DEFAULT 0,
	"report_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delivery_options" (
	"id" uuid PRIMARY KEY NOT NULL,
	"provider_id" uuid NOT NULL,
	"seller_id" uuid,
	"product_id" uuid,
	"name" varchar(100) NOT NULL,
	"type" "delivery_type" NOT NULL,
	"description" text,
	"base_cost" numeric(8, 2) NOT NULL,
	"cost_per_km" numeric(6, 4) DEFAULT '0.0000',
	"cost_per_kg" numeric(6, 2) DEFAULT '0.00',
	"free_shipping_threshold" numeric(10, 2),
	"estimated_min_hours" integer,
	"estimated_max_hours" integer,
	"max_weight" numeric(8, 3),
	"max_dimensions" text,
	"restricted_areas" text,
	"requires_pickup_time" boolean DEFAULT false,
	"allow_weekend_delivery" boolean DEFAULT true,
	"allow_evening_delivery" boolean DEFAULT false,
	"requires_signature" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delivery_providers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"logo" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"website" varchar(255),
	"api_url" text,
	"api_key" varchar(255),
	"tracking_url_template" text,
	"coverage_areas" text,
	"supported_services" text,
	"commission_rate" numeric(5, 4) DEFAULT '0.0000',
	"status" "delivery_provider_status" DEFAULT 'ACTIVE' NOT NULL,
	"is_verified" boolean DEFAULT false,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_deliveries" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_providers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delivery_zones" (
	"id" uuid PRIMARY KEY NOT NULL,
	"provider_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"areas" text,
	"coordinates" text,
	"base_cost" numeric(8, 2) NOT NULL,
	"cost_multiplier" numeric(4, 2) DEFAULT '1.00',
	"estimated_hours" integer NOT NULL,
	"max_weight" numeric(8, 3),
	"restricted_days" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "device_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(500) NOT NULL,
	"platform" varchar(20) NOT NULL,
	"device_id" varchar(255),
	"app_version" varchar(50),
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "device_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"email_enabled" boolean DEFAULT true,
	"push_enabled" boolean DEFAULT true,
	"sms_enabled" boolean DEFAULT false,
	"type_preferences" text,
	"quiet_hours_enabled" boolean DEFAULT false,
	"quiet_hours_start" varchar(5) DEFAULT '22:00',
	"quiet_hours_end" varchar(5) DEFAULT '08:00',
	"timezone" varchar(50) DEFAULT 'Europe/Paris',
	"max_emails_per_day" integer DEFAULT 10,
	"max_push_per_day" integer DEFAULT 20,
	"max_sms_per_month" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipient_id" uuid NOT NULL,
	"sender_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"action_url" varchar(500),
	"image_url" varchar(500),
	"metadata" text,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"channels" text,
	"email_sent" boolean DEFAULT false,
	"email_sent_at" timestamp,
	"push_sent" boolean DEFAULT false,
	"push_sent_at" timestamp,
	"sms_sent" boolean DEFAULT false,
	"sms_sent_at" timestamp,
	"scheduled_for" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delivery_options" ADD CONSTRAINT "delivery_options_provider_id_delivery_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "delivery_providers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delivery_options" ADD CONSTRAINT "delivery_options_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delivery_options" ADD CONSTRAINT "delivery_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delivery_zones" ADD CONSTRAINT "delivery_zones_provider_id_delivery_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "delivery_providers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
