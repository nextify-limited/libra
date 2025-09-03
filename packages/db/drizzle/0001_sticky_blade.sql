ALTER TABLE "project" ALTER COLUMN "deployment_status" SET DEFAULT 'idle';--> statement-breakpoint
ALTER TABLE "subscription_limit" ADD COLUMN "last_quota_refresh" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscription_limit" ADD COLUMN "billing_interval" text DEFAULT 'month';