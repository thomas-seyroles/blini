ALTER TABLE "reviews" ADD COLUMN "rating" smallint DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";