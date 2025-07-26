ALTER TABLE "users" RENAME COLUMN "auth_id" TO "clerk_id";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_auth_id_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");