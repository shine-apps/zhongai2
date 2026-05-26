CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(100) NOT NULL,
	"category" varchar(30) NOT NULL,
	"description" text,
	"cover_image" varchar(500),
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"location" varchar(200),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"checkin_radius" integer DEFAULT 200,
	"max_participants" integer,
	"current_participants" integer DEFAULT 0,
	"reward_points" integer NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"organizer_id" uuid NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activity_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"checkin_type" varchar(20) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"checkin_time" timestamp with time zone DEFAULT now(),
	"verified" boolean DEFAULT false,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"points_granted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_activity_checkins_activity_user" UNIQUE("activity_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "activity_galleries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"media_type" varchar(10) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"file_size" bigint,
	"width" integer,
	"height" integer,
	"duration" integer,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activity_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"remark" varchar(200),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_activity_registrations_activity_user" UNIQUE("activity_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(100) NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"link_type" varchar(20),
	"link_value" varchar(500),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"donation_type" varchar(20) NOT NULL,
	"amount" numeric(12, 2),
	"material_desc" text,
	"material_value" numeric(12, 2),
	"evidence_images" jsonb DEFAULT '[]'::jsonb,
	"evidence_desc" text,
	"status" varchar(20) DEFAULT 'pending',
	"reviewer_id" uuid,
	"reviewed_at" timestamp with time zone,
	"review_remark" varchar(200),
	"points_granted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"images" varchar(500)[],
	"contact_info" varchar(100),
	"status" varchar(20) DEFAULT 'pending',
	"priority" varchar(10) DEFAULT 'normal',
	"assigned_to" uuid,
	"response" text,
	"response_time" timestamp with time zone,
	"resolved_time" timestamp with time zone,
	"user_rating" integer,
	"user_rating_note" varchar(200),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "honor_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"description" varchar(500),
	"image_url" varchar(500),
	"unlock_type" varchar(20) NOT NULL,
	"unlock_value" integer NOT NULL,
	"unlock_level" integer DEFAULT 0,
	"unlock_activity_count" integer DEFAULT 0,
	"unlock_donation_amount" numeric(10, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"stock" integer DEFAULT -1,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "honor_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"item_name" varchar(100) NOT NULL,
	"item_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"certificate_no" varchar(50),
	"certificate_url" varchar(500),
	"issue_time" timestamp with time zone,
	"receive_time" timestamp with time zone,
	"receive_location" varchar(200),
	"receive_contact" varchar(100),
	"issued_by" uuid,
	"note" varchar(200),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_honor_records_user_item" UNIQUE("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "market_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_type" varchar(20) NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"contact_info" varchar(200),
	"points_cost" integer NOT NULL,
	"point_type_used" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"reviewer_id" uuid,
	"reviewed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"activity_remind" boolean DEFAULT true,
	"activity_result" boolean DEFAULT true,
	"donation_result" boolean DEFAULT true,
	"points_change" boolean DEFAULT true,
	"order_update" boolean DEFAULT true,
	"market_interaction" boolean DEFAULT true,
	"system_notice" boolean DEFAULT true,
	"wechat_enabled" boolean DEFAULT true,
	"sms_enabled" boolean DEFAULT false,
	"quiet_hours_start" time,
	"quiet_hours_end" time,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "notification_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(30) NOT NULL,
	"title_template" varchar(200) NOT NULL,
	"content_template" text NOT NULL,
	"wechat_template_id" varchar(100),
	"sms_template_code" varchar(100),
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "notification_templates_template_code_unique" UNIQUE("template_code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "point_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_points_balance" integer DEFAULT 0,
	"activity_points_total" integer DEFAULT 0,
	"donation_points_balance" integer DEFAULT 0,
	"donation_points_total" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "point_accounts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "point_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_type" varchar(30) NOT NULL,
	"point_type" varchar(20) NOT NULL,
	"points_per_unit" integer NOT NULL,
	"unit_desc" varchar(50),
	"min_amount" numeric(12, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "point_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"point_type" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"source_type" varchar(30) NOT NULL,
	"source_id" uuid,
	"description" varchar(200),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"openid" varchar(64) NOT NULL,
	"union_id" varchar(64),
	"phone" varchar(20),
	"nickname" varchar(50),
	"avatar_url" varchar(500),
	"username" varchar(50),
	"password_hash" varchar(255),
	"real_name" varchar(50),
	"id_card_no" varchar(18),
	"real_name_verified" boolean DEFAULT false,
	"member_no" varchar(20),
	"role" varchar(20) DEFAULT 'volunteer',
	"status" varchar(20) DEFAULT 'active',
	"honor_level" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_openid_unique" UNIQUE("openid"),
	CONSTRAINT "users_union_id_unique" UNIQUE("union_id"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_member_no_unique" UNIQUE("member_no")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_checkins" ADD CONSTRAINT "activity_checkins_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_checkins" ADD CONSTRAINT "activity_checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_checkins" ADD CONSTRAINT "activity_checkins_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_galleries" ADD CONSTRAINT "activity_galleries_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honor_records" ADD CONSTRAINT "honor_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honor_records" ADD CONSTRAINT "honor_records_item_id_honor_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."honor_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honor_records" ADD CONSTRAINT "honor_records_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_posts" ADD CONSTRAINT "market_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_posts" ADD CONSTRAINT "market_posts_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_accounts" ADD CONSTRAINT "point_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activities_organizer_id" ON "activities" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "idx_activities_status" ON "activities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_activities_category" ON "activities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_activities_start_time" ON "activities" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_activities_created_at" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_checkins_activity_id" ON "activity_checkins" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "idx_activity_checkins_user_id" ON "activity_checkins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_checkins_checkin_time" ON "activity_checkins" USING btree ("checkin_time");--> statement-breakpoint
CREATE INDEX "idx_activity_galleries_activity_id" ON "activity_galleries" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "idx_activity_registrations_activity_id" ON "activity_registrations" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "idx_activity_registrations_user_id" ON "activity_registrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_registrations_status" ON "activity_registrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_banners_is_active" ON "banners" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_banners_sort_order" ON "banners" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_donations_user_id" ON "donations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_donations_status" ON "donations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_donations_donation_type" ON "donations" USING btree ("donation_type");--> statement-breakpoint
CREATE INDEX "idx_donations_created_at" ON "donations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_user_id" ON "feedbacks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_status" ON "feedbacks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_type" ON "feedbacks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_assigned_to" ON "feedbacks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_honor_items_type" ON "honor_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_honor_items_is_active" ON "honor_items" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_honor_records_user_id" ON "honor_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_honor_records_item_id" ON "honor_records" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_honor_records_status" ON "honor_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_market_posts_user_id" ON "market_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_market_posts_status" ON "market_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_market_posts_post_type" ON "market_posts" USING btree ("post_type");--> statement-breakpoint
CREATE INDEX "idx_market_posts_created_at" ON "market_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notification_settings_user_id" ON "notification_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notification_templates_type" ON "notification_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notification_templates_is_active" ON "notification_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notifications_is_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_point_accounts_user_id" ON "point_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_point_rules_rule_type" ON "point_rules" USING btree ("rule_type");--> statement-breakpoint
CREATE INDEX "idx_point_rules_is_active" ON "point_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_point_transactions_user_id" ON "point_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_point_transactions_point_type" ON "point_transactions" USING btree ("point_type");--> statement-breakpoint
CREATE INDEX "idx_point_transactions_source_type" ON "point_transactions" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "idx_point_transactions_created_at" ON "point_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_openid" ON "users" USING btree ("openid");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_member_no" ON "users" USING btree ("member_no");