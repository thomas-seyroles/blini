CREATE TABLE "playlist_entries" (
	"playlist_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	"story_id" text,
	"region_slug" text,
	CONSTRAINT "playlist_entries_playlist_id_position_pk" PRIMARY KEY("playlist_id","position"),
	CONSTRAINT "playlist_entries_one_target" CHECK (("playlist_entries"."story_id" is null) <> ("playlist_entries"."region_slug" is null))
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"journey_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "playlists_userId_journeyId_unique" UNIQUE("user_id","journey_id")
);
--> statement-breakpoint
ALTER TABLE "playlist_entries" ADD CONSTRAINT "playlist_entries_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_entries" ADD CONSTRAINT "playlist_entries_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_entries" ADD CONSTRAINT "playlist_entries_region_slug_regions_slug_fk" FOREIGN KEY ("region_slug") REFERENCES "public"."regions"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;