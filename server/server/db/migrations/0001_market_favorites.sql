-- Drop old indexes
DROP INDEX IF EXISTS "idx_market_posts_post_type";--> statement-breakpoint
-- Rename post_type -> type
ALTER TABLE "market_posts" RENAME COLUMN "post_type" TO "type";--> statement-breakpoint
-- Drop removed columns
ALTER TABLE "market_posts" DROP COLUMN IF EXISTS "points_cost";--> statement-breakpoint
ALTER TABLE "market_posts" DROP COLUMN IF EXISTS "point_type_used";--> statement-breakpoint
ALTER TABLE "market_posts" DROP COLUMN IF EXISTS "reviewed_at";--> statement-breakpoint
ALTER TABLE "market_posts" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
-- Rename reviewer_id -> reviewed_by
ALTER TABLE "market_posts" RENAME COLUMN "reviewer_id" TO "reviewed_by";--> statement-breakpoint
-- Add new columns
ALTER TABLE "market_posts" ADD COLUMN "location" varchar(100);--> statement-breakpoint
ALTER TABLE "market_posts" ADD COLUMN "price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "market_posts" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "market_posts" ADD COLUMN "favorite_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "market_posts" ADD COLUMN "review_note" varchar(200);--> statement-breakpoint
-- Recreate index on type column
CREATE INDEX "idx_market_posts_type" ON "market_posts" ("type");--> statement-breakpoint
-- Create market_favorites table
CREATE TABLE "market_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uniq_market_favorites_post_user" UNIQUE("post_id","user_id")
);--> statement-breakpoint
-- Add foreign keys for market_favorites
ALTER TABLE "market_favorites" ADD CONSTRAINT "market_favorites_post_id_market_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."market_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_favorites" ADD CONSTRAINT "market_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Create index on market_favorites user_id
CREATE INDEX "idx_market_favorites_user_id" ON "market_favorites" ("user_id");
