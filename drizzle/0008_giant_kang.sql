DROP VIEW "public"."point_events";--> statement-breakpoint
ALTER TABLE "user_items" DROP CONSTRAINT "user_items_user_id_item_id_pk";--> statement-breakpoint
ALTER TABLE "user_items" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_items" ADD COLUMN "used_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "user_items_user_id_index" ON "user_items" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "points_used";--> statement-breakpoint
CREATE VIEW "public"."point_events" AS (
    select 'validation:' || a.id as id, a.user_id, 'Anecdote validée : ' || a.title as label, 50 as points, a.validated_at as at
    from anecdotes a where a.validated_at is not null
    union all
    select 'retenue:' || a.id, a.user_id, 'Anecdote retenue par Lunii : ' || a.title, 300, coalesce(a.validated_at, a.created_at)
    from anecdotes a where a.status >= 2
    union all
    select 'trajet:' || b.id, b.passenger_id, 'Trajet effectué : ' || cf.name || ' → ' || ct.name, 40, j.arrive_at
    from bookings b
    join journeys j on j.id = b.journey_id
    join cities cf on cf.slug = j.from_city
    join cities ct on ct.slug = j.to_city
    where b.status = 'acceptee' and j.cancelled_at is null and j.arrive_at < now()
    union all
    select 'conduite:' || j.id, j.driver_id, 'Trajet conduit : ' || cf.name || ' → ' || ct.name, 60, j.arrive_at
    from journeys j
    join cities cf on cf.slug = j.from_city
    join cities ct on ct.slug = j.to_city
    where j.cancelled_at is null and j.arrive_at < now()
    union all
    select 'item:' || ui.id, ui.user_id, 'Échange : ' || i.title, -i.cost_points, ui.created_at
    from user_items ui join items i on i.id = ui.item_id
);