CREATE TABLE "story_contributors" (
	"story_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "story_contributors_story_id_user_id_pk" PRIMARY KEY("story_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "lunii_author" text DEFAULT 'Équipe d’auteurs Lunii' NOT NULL;--> statement-breakpoint
ALTER TABLE "story_contributors" ADD CONSTRAINT "story_contributors_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_contributors" ADD CONSTRAINT "story_contributors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "story_contributors_user_id_index" ON "story_contributors" USING btree ("user_id");