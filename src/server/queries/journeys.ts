import "server-only";
import { and, asc, desc, eq, gt, gte, inArray, isNull, lt, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { DEFAULT_PHOTO, cityName, citySlug, durationLabel, type Journey } from "@/lib/journeys";
import { parisDate, parisParts } from "@/lib/time";
import { shiftIso } from "@/lib/trip";
import { db } from "../db";
import { cities, driverProfiles, journeys, reviews, userBadges, users } from "../db/schema";
import { routeRegions } from "../geo";
import { isUuid } from "../validate";
import { getCities } from "./catalog";

const fromCity = alias(cities, "from_city");
const toCity = alias(cities, "to_city");

// Places prises par les demandes et réservations acceptées, passagers à bord, expérience du conducteur
const taken = sql<number>`coalesce((select sum(b.seats) from bookings b where b.journey_id = ${journeys.id} and b.status in ('demande', 'acceptee')), 0)::int`;
const aboard = sql<{ id: string; name: string; photo: string | null; trips: number }[]>`coalesce((select jsonb_agg(jsonb_build_object('id', u.id, 'name', u.first_name, 'photo', u.photo, 'trips', (select count(*) from bookings x join journeys xj on xj.id = x.journey_id where x.passenger_id = u.id and x.status = 'acceptee' and xj.cancelled_at is null and xj.arrive_at < now())) order by b.created_at) from bookings b join users u on u.id = b.passenger_id where b.journey_id = ${journeys.id} and b.status = 'acceptee'), '[]'::jsonb)`;
const driverTrips = sql<number>`(select count(*) from journeys d where d.driver_id = ${journeys.driverId} and d.cancelled_at is null and d.arrive_at < now())::int`;

export type JourneyRow = Awaited<ReturnType<typeof selectJourneys>>[number];

export function selectJourneys(where: SQL | undefined) {
    return db
        .select({
            journey: journeys,
            from: fromCity,
            to: toCity,
            driver: { id: users.id, firstName: users.firstName, photo: users.photo },
            profile: driverProfiles,
            taken,
            aboard,
            driverTrips,
        })
        .from(journeys)
        .innerJoin(fromCity, eq(fromCity.slug, journeys.fromCity))
        .innerJoin(toCity, eq(toCity.slug, journeys.toCity))
        .innerJoin(users, eq(users.id, journeys.driverId))
        .leftJoin(driverProfiles, eq(driverProfiles.userId, journeys.driverId))
        .where(where)
        .orderBy(asc(journeys.departAt));
}

export async function toJourney({ journey: j, from, to, driver, profile, taken, aboard, driverTrips }: JourneyRow): Promise<Journey> {
    const depart = parisParts(j.departAt);
    const seatsLeft = Math.max(0, j.seats - taken);
    return {
        id: j.id,
        date: depart.date,
        kind: seatsLeft === 0 || j.cancelledAt ? "complet" : j.certified ? "certifie" : "standard",
        departTime: depart.time,
        arrivalTime: parisParts(j.arriveAt).time,
        duration: durationLabel(Math.round((j.arriveAt.getTime() - j.departAt.getTime()) / 60_000)),
        km: j.km,
        price: j.priceCents / 100,
        seatsLeft,
        from: `${from.name} · ${j.fromSpot}`,
        fromAddress: j.fromAddress,
        to: `${to.name} · ${j.toSpot}`,
        toAddress: j.toAddress,
        driver: {
            id: driver.id,
            name: driver.firstName,
            female: profile?.female ?? false,
            car: profile?.car ?? "Véhicule à préciser",
            color: profile?.color ?? "",
            rating: profile ? profile.rating.toLocaleString("fr-FR", { minimumFractionDigits: 1 }) : "Nouveau",
            reviews: profile?.reviewsCount ?? 0,
            trips: driverTrips,
            photo: driver.photo ?? DEFAULT_PHOTO,
            bio: profile?.bio ?? "",
            equipments: profile?.equipments ?? [],
        },
        aboard: aboard.map((p) => ({ ...p, photo: p.photo ?? DEFAULT_PHOTO })),
        regions: routeRegions(from, to, await getCities()),
    };
}

export async function getJourney(id: string) {
    if (!isUuid(id)) return null;
    const [row] = await selectJourneys(eq(journeys.id, id));
    return row ? toJourney(row) : null;
}

export async function getJourneys(ids: string[]) {
    if (!ids.length) return [];
    return Promise.all((await selectJourneys(inArray(journeys.id, ids))).map(toJourney));
}

// Recherche : trajets encore à venir entre deux villes, sur une journée
export async function searchJourneys(fromLabel: string, toLabel: string, date: string) {
    const from = citySlug(cityName(fromLabel));
    const to = citySlug(cityName(toLabel));
    const rows = await selectJourneys(
        and(
            eq(journeys.fromCity, from),
            eq(journeys.toCity, to),
            gte(journeys.departAt, parisDate(date, "00:00")),
            lt(journeys.departAt, parisDate(shiftIso(date, 1), "00:00")),
            gt(journeys.departAt, sql`now()`),
            isNull(journeys.cancelledAt),
        ),
    );
    return Promise.all(rows.map(toJourney));
}

// Régions traversées entre deux villes connues, vide si l'une est inconnue
export async function regionsBetween(fromLabel: string, toLabel: string) {
    const all = await getCities();
    const from = all.find((c) => c.slug === citySlug(cityName(fromLabel)));
    const to = all.find((c) => c.slug === citySlug(cityName(toLabel)));
    return from && to ? routeRegions(from, to, all) : [];
}

export async function getDriverReviews(driverId: string, limit = 3) {
    const rows = await db
        .select({ id: reviews.id, author: users.firstName, photo: users.photo, rating: reviews.rating, text: reviews.text })
        .from(reviews)
        .innerJoin(users, eq(users.id, reviews.authorId))
        .where(eq(reviews.driverId, driverId))
        .orderBy(desc(reviews.createdAt))
        .limit(limit);
    return rows.map((r) => ({ ...r, photo: r.photo ?? DEFAULT_PHOTO }));
}

export async function getDriverBadges(driverId: string) {
    const rows = await db.select({ regionSlug: userBadges.regionSlug }).from(userBadges).where(eq(userBadges.userId, driverId)).orderBy(userBadges.createdAt);
    return rows.map((r) => r.regionSlug);
}
