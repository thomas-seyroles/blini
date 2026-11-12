CREATE TABLE "user_badges" (
	"user_id" uuid NOT NULL,
	"region_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_badges_user_id_region_slug_pk" PRIMARY KEY("user_id","region_slug")
);
--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_region_slug_regions_slug_fk" FOREIGN KEY ("region_slug") REFERENCES "public"."regions"("slug") ON DELETE cascade ON UPDATE no action;