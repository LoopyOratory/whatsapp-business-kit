CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'starter', 'growth', 'business');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'staff');--> statement-breakpoint
CREATE TABLE "pricing_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "subscription_tier" NOT NULL,
	"name" text NOT NULL,
	"price_ghs" numeric NOT NULL,
	"price_usd" numeric NOT NULL,
	"max_users" integer NOT NULL,
	"max_products" integer NOT NULL,
	"max_messages" integer NOT NULL,
	"max_broadcasts" integer NOT NULL,
	"broadcasts_enabled" boolean DEFAULT false,
	"analytics_enabled" boolean DEFAULT false,
	"priority_support" boolean DEFAULT false,
	"api_access" boolean DEFAULT false,
	"custom_branding" boolean DEFAULT false,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_tiers_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'staff'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "subscription_status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "subscription_expires_at" timestamp;