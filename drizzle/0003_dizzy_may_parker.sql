CREATE TABLE "package_orders" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"recipient" text NOT NULL,
	"street" text NOT NULL,
	"postal_code" text NOT NULL,
	"city" text NOT NULL,
	"conteuse" boolean NOT NULL,
	"total_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "blablacar_trips" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "package_orders" ADD CONSTRAINT "package_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;