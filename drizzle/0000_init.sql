CREATE TYPE "public"."booking_status" AS ENUM('demande', 'acceptee', 'refusee', 'annulee');--> statement-breakpoint
CREATE TYPE "public"."item_category" AS ENUM('objet', 'histoire', 'reduction', 'badge');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('passager', 'conducteur');--> statement-breakpoint
CREATE TYPE "public"."story_source" AS ENUM('achat', 'cadeau');--> statement-breakpoint
CREATE TYPE "public"."tint" AS ENUM('jaune', 'turquoise', 'bleu');--> statement-breakpoint
CREATE TABLE "anecdotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"journey_id" uuid,
	"region_slug" text,
	"title" text NOT NULL,
	"place" text NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"audio_sec" integer NOT NULL,
	"photo" "bytea",
	"status" smallint DEFAULT 0 NOT NULL,
	"validated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journey_id" uuid NOT NULL,
	"passenger_id" uuid NOT NULL,
	"seats" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"points_used" integer DEFAULT 0 NOT NULL,
	"status" "booking_status" DEFAULT 'demande' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_journeyId_passengerId_unique" UNIQUE("journey_id","passenger_id")
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region_slug" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"female" boolean NOT NULL,
	"car" text NOT NULL,
	"color" text NOT NULL,
	"bio" text NOT NULL,
	"rating" real NOT NULL,
	"reviews_count" integer NOT NULL,
	"equipments" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"cost_points" integer NOT NULL,
	"image" text NOT NULL,
	"category" "item_category" NOT NULL,
	"tint" "tint" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" uuid NOT NULL,
	"from_city" text NOT NULL,
	"from_spot" text NOT NULL,
	"from_address" text NOT NULL,
	"to_city" text NOT NULL,
	"to_spot" text NOT NULL,
	"to_address" text NOT NULL,
	"depart_at" timestamp with time zone NOT NULL,
	"arrive_at" timestamp with time zone NOT NULL,
	"km" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"seats" integer NOT NULL,
	"certified" boolean NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cover" text,
	"pack_price_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" text PRIMARY KEY NOT NULL,
	"region_slug" text NOT NULL,
	"anecdote_id" uuid,
	"title" text NOT NULL,
	"author_credit" text NOT NULL,
	"age_label" text NOT NULL,
	"duration_sec" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_items" (
	"user_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_items_user_id_item_id_pk" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "user_stories" (
	"user_id" uuid NOT NULL,
	"story_id" text NOT NULL,
	"source" "story_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_stories_user_id_story_id_pk" PRIMARY KEY("user_id","story_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"photo" text,
	"role" "role" DEFAULT 'passager' NOT NULL,
	"blablacar_id" text,
	"lunii_id" text,
	"rules_accepted_at" timestamp with time zone,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_blablacarId_unique" UNIQUE("blablacar_id"),
	CONSTRAINT "users_luniiId_unique" UNIQUE("lunii_id")
);
--> statement-breakpoint
ALTER TABLE "anecdotes" ADD CONSTRAINT "anecdotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anecdotes" ADD CONSTRAINT "anecdotes_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anecdotes" ADD CONSTRAINT "anecdotes_region_slug_regions_slug_fk" FOREIGN KEY ("region_slug") REFERENCES "public"."regions"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_region_slug_regions_slug_fk" FOREIGN KEY ("region_slug") REFERENCES "public"."regions"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_from_city_cities_slug_fk" FOREIGN KEY ("from_city") REFERENCES "public"."cities"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_to_city_cities_slug_fk" FOREIGN KEY ("to_city") REFERENCES "public"."cities"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_region_slug_regions_slug_fk" FOREIGN KEY ("region_slug") REFERENCES "public"."regions"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_anecdote_id_anecdotes_id_fk" FOREIGN KEY ("anecdote_id") REFERENCES "public"."anecdotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stories" ADD CONSTRAINT "user_stories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stories" ADD CONSTRAINT "user_stories_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anecdotes_user_id_index" ON "anecdotes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_passenger_id_index" ON "bookings" USING btree ("passenger_id");--> statement-breakpoint
CREATE INDEX "journeys_from_city_to_city_depart_at_index" ON "journeys" USING btree ("from_city","to_city","depart_at");--> statement-breakpoint
CREATE INDEX "journeys_driver_id_index" ON "journeys" USING btree ("driver_id");--> statement-breakpoint
CREATE VIEW "public"."point_events" AS (
    select 'anecdote:' || a.id as id, a.user_id, 'Anecdote envoyée : ' || a.title as label, 20 as points, a.created_at as at
    from anecdotes a
    union all
    select 'validation:' || a.id, a.user_id, 'Anecdote validée : ' || a.title, 50, a.validated_at
    from anecdotes a where a.validated_at is not null
    union all
    select 'retenue:' || a.id, a.user_id, 'Anecdote retenue par Lunii : ' || a.title, 300, coalesce(a.validated_at, a.created_at)
    from anecdotes a where a.status >= 2
    union all
    select 'trajet:' || b.id, b.passenger_id, 'Trajet effectué : ' || cf.name || ' → ' || ct.name, 20, j.arrive_at
    from bookings b
    join journeys j on j.id = b.journey_id
    join cities cf on cf.slug = j.from_city
    join cities ct on ct.slug = j.to_city
    where b.status = 'acceptee' and j.cancelled_at is null and j.arrive_at < now()
    union all
    select 'conduite:' || j.id, j.driver_id, 'Trajet conduit : ' || cf.name || ' → ' || ct.name, 30, j.arrive_at
    from journeys j
    join cities cf on cf.slug = j.from_city
    join cities ct on ct.slug = j.to_city
    where j.cancelled_at is null and j.arrive_at < now()
    union all
    select 'item:' || ui.item_id, ui.user_id, 'Échange : ' || i.title, -i.cost_points, ui.created_at
    from user_items ui join items i on i.id = ui.item_id
    union all
    select 'remise:' || b.id, b.passenger_id, 'Points utilisés sur une réservation', -b.points_used, b.created_at
    from bookings b where b.points_used > 0 and b.status in ('demande', 'acceptee')
);