import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { and, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import type { Anecdote } from "@/lib/anecdotes";
import type { AppData } from "@/lib/appData";
import { city, type Journey } from "@/lib/journeys";
import type { Playlist } from "@/lib/playlists";
import { POINTS } from "@/lib/points";
import { parisParts, todayIso } from "@/lib/time";
import { dayInfo } from "@/lib/trip";
import type { BookedTrip } from "@/lib/trips";
import { getCurrentUser } from "../auth";
import { db } from "../db";
import { anecdotes, bookings, journeys, packageOrders, playlistEntries, userBadges, playlists, pointEvents, userItems, userStories, users } from "../db/schema";
import { getJourneys, selectJourneys, toJourney } from "./journeys";

const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Europe/Paris" });
const dateLabel = (d: Date) => (parisParts(d).date === todayIso() ? "Aujourd’hui" : shortDate.format(d));

// Champs communs aux trajets passager et conducteur
const tripBase = (j: Journey) => ({
    day: `${dayInfo(j.date).short} ${dayInfo(j.date).date}`,
    date: j.date,
    time: j.departTime,
    arrivalTime: j.arrivalTime,
    from: city(j.from),
    to: city(j.to),
    driver: j.driver.name,
    journey: j,
});

async function getTrips(userId: string): Promise<BookedTrip[]> {
    const now = new Date();
    const [mine, driven] = await Promise.all([
        db.select({ booking: bookings, arriveAt: journeys.arriveAt, cancelledAt: journeys.cancelledAt }).from(bookings).innerJoin(journeys, eq(journeys.id, bookings.journeyId)).where(eq(bookings.passengerId, userId)),
        selectJourneys(eq(journeys.driverId, userId)),
    ]);

    const booked = new Map((await getJourneys(mine.map((m) => m.booking.journeyId))).map((j) => [j.id, j]));
    const asPassenger = mine.map(({ booking: b, arriveAt, cancelledAt }): BookedTrip => {
        const cancelled = b.status === "annulee" || b.status === "refusee" || !!cancelledAt;
        const past = arriveAt < now;
        return {
            ...tripBase(booked.get(b.journeyId)!),
            id: b.id,
            role: "passager",
            status: cancelled || (past && b.status !== "acceptee") ? "annule" : past ? "termine" : "a-venir",
            pending: b.status === "demande",
            points: POINTS.trajet,
            places: b.seats,
            price: b.priceCents / 100,
            passagers: [],
            demandes: [],
        };
    });

    const requests = driven.length
        ? await db
              .select({ id: bookings.id, journeyId: bookings.journeyId, status: bookings.status, seats: bookings.seats, name: users.firstName })
              .from(bookings)
              .innerJoin(users, eq(users.id, bookings.passengerId))
              .where(and(inArray(bookings.journeyId, driven.map((r) => r.journey.id)), inArray(bookings.status, ["demande", "acceptee"])))
        : [];
    const asDriver = await Promise.all(
        driven.map(async (row): Promise<BookedTrip> => {
            const j = row.journey;
            const mineOnly = requests.filter((r) => r.journeyId === j.id);
            return {
                ...tripBase(await toJourney(row)),
                id: j.id,
                role: "conducteur",
                status: j.cancelledAt ? "annule" : j.arriveAt < now ? "termine" : "a-venir",
                pending: false,
                points: POINTS.conduite,
                places: j.seats,
                price: j.priceCents / 100,
                passagers: mineOnly.filter((r) => r.status === "acceptee").map((r) => ({ name: r.name, places: r.seats })),
                demandes: mineOnly.filter((r) => r.status === "demande").map((r) => ({ id: r.id, name: r.name, places: r.seats })),
            };
        }),
    );

    return [...asPassenger, ...asDriver];
}

async function getPlaylists(userId: string): Promise<Playlist[]> {
    const rows = await db
        .select({ journeyId: playlists.journeyId, storyId: playlistEntries.storyId, regionSlug: playlistEntries.regionSlug })
        .from(playlists)
        .innerJoin(playlistEntries, eq(playlistEntries.playlistId, playlists.id))
        .where(eq(playlists.userId, userId))
        .orderBy(playlists.id, playlistEntries.position);
    const byJourney = new Map<string, Playlist>();
    for (const r of rows) {
        const list = byJourney.get(r.journeyId) ?? { journeyId: r.journeyId, entries: [] };
        list.entries.push(r.storyId ? { kind: "story", id: r.storyId } : { kind: "collection", id: r.regionSlug! });
        byJourney.set(r.journeyId, list);
    }
    return [...byJourney.values()];
}

async function getAnecdotes(userId: string): Promise<Anecdote[]> {
    const rows = await db
        .select({
            id: anecdotes.id,
            journeyId: anecdotes.journeyId,
            title: anecdotes.title,
            place: anecdotes.place,
            details: anecdotes.details,
            audioSec: anecdotes.audioSec,
            hasAudio: sql<boolean>`${anecdotes.audio} is not null`,
            hasPhoto: sql<boolean>`${anecdotes.photo} is not null`,
            status: anecdotes.status,
            validatedAt: anecdotes.validatedAt,
            createdAt: anecdotes.createdAt,
        })
        .from(anecdotes)
        .where(eq(anecdotes.userId, userId))
        .orderBy(desc(anecdotes.createdAt));

    const ids = [...new Set(rows.flatMap((r) => r.journeyId ?? []))];
    const [trips, riders] = await Promise.all([
        getJourneys(ids),
        ids.length
            ? db
                  .select({ journeyId: bookings.journeyId, name: users.firstName })
                  .from(bookings)
                  .innerJoin(users, eq(users.id, bookings.passengerId))
                  .where(and(inArray(bookings.journeyId, ids), eq(bookings.status, "acceptee"), ne(bookings.passengerId, userId)))
            : [],
    ]);

    return rows.map((r) => {
        const j = trips.find((t) => t.id === r.journeyId);
        const companions = j
            ? [
                  ...(j.driver.id !== userId ? [{ name: j.driver.name, driver: true }] : []),
                  ...riders.filter((p) => p.journeyId === j.id).map((p) => ({ name: p.name, driver: false })),
              ]
            : [];
        return {
            id: r.id,
            title: r.title,
            place: r.place,
            audioSec: r.audioSec,
            audioUrl: r.hasAudio ? `/api/anecdotes/${r.id}/audio` : undefined,
            hasPhoto: r.hasPhoto,
            photoUrl: r.hasPhoto ? `/api/anecdotes/${r.id}/photo` : undefined,
            details: r.details,
            status: r.status as Anecdote["status"],
            points: (r.validatedAt ? POINTS.validation : 0) + (r.status >= 2 ? POINTS.retenue : 0),
            sentAt: dateLabel(r.createdAt),
            validated: !!r.validatedAt,
            tripLabel: j ? `${city(j.from)} → ${city(j.to)}` : "Hors trajet",
            companions,
        };
    });
}

// Tout l'état du compte connecté, null sans session valide
export const getAppData = cache(async (): Promise<AppData | null> => {
    const user = await getCurrentUser();
    if (!user) return null;
    await connection();

    const [history, library, inventory, badgeRows, anecdoteList, trips, playlistList, [order]] = await Promise.all([
        db.select().from(pointEvents).where(eq(pointEvents.userId, user.id)).orderBy(desc(pointEvents.at)),
        db.select().from(userStories).where(eq(userStories.userId, user.id)),
        db.select({ itemId: userItems.itemId }).from(userItems).where(and(eq(userItems.userId, user.id), isNull(userItems.usedAt))),
        db.select({ regionSlug: userBadges.regionSlug }).from(userBadges).where(eq(userBadges.userId, user.id)).orderBy(userBadges.createdAt),
        getAnecdotes(user.id),
        getTrips(user.id),
        getPlaylists(user.id),
        db.select().from(packageOrders).where(eq(packageOrders.userId, user.id)),
    ]);

    return {
        profile: { firstName: user.firstName, lastName: user.lastName, email: user.email, photo: user.photo, role: user.role, rulesAccepted: !!user.rulesAcceptedAt },
        linked: { blablacar: !!user.blablacarId, lunii: !!user.luniiId },
        settings: user.settings,
        points: history.reduce((sum, e) => sum + e.points, 0),
        history: history.map((e) => ({ id: e.id, label: e.label, points: e.points, date: dateLabel(e.at) })),
        ownedStories: library.filter((s) => s.source === "achat").map((s) => s.storyId),
        gifts: library.filter((s) => s.source === "cadeau").map((s) => s.storyId),
        inventory: inventory.map((i) => i.itemId),
        badges: badgeRows.map((b) => b.regionSlug),
        anecdotes: anecdoteList,
        trips,
        playlists: playlistList,
        blablacarTrips: user.blablacarTrips,
        packageOrder: order ? { recipient: order.recipient, street: order.street, postalCode: order.postalCode, city: order.city, conteuse: order.conteuse, totalCents: order.totalCents } : null,
    };
});
