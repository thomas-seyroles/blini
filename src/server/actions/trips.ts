"use server";

import { and, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { cityName, citySlug, estimatePrice, placesFor, travelMinutes } from "@/lib/journeys";
import { PACK_SIZE, PROMO_CODE, VOUCHER_ITEM_ID, canUseVoucher, quote } from "@/lib/quote";
import { parisDate, todayIso } from "@/lib/time";
import { requireUser } from "../auth";
import { db } from "../db";
import { bookings, cities, journeys, stories, userItems, userStories } from "../db/schema";
import { roadKm } from "../geo";
import { getJourneys } from "../queries/journeys";
import { intIn, isIsoDate, isUuid, text } from "../validate";

const PUBLISH_TIME = "08:30";

export type BookingInput = { allerId: string; retourId: string | null; passengers: number; pack: boolean; useVoucher: boolean; promo: string | null };

// Réservation avec faux paiement : aucune transaction bancaire, les places sont demandées au conducteur
export async function bookJourneys(input: BookingInput) {
    const user = await requireUser();
    const passengers = intIn(input.passengers, 1, 8);
    const ids = [input.allerId, input.retourId].filter((id): id is string => !!id);
    if (!passengers || !ids.every(isUuid)) return { error: "Réservation invalide." };

    const found = await getJourneys(ids);
    const aller = found.find((j) => j.id === input.allerId) ?? null;
    const retour = input.retourId ? (found.find((j) => j.id === input.retourId) ?? null) : null;
    if (!aller || (input.retourId && !retour)) return { error: "Ce trajet n’existe plus." };
    const legs = [aller, retour].filter((j) => !!j);
    if (legs.some((j) => j.kind === "complet" || j.driver.id === user.id)) return { error: "Ce trajet n’est plus disponible." };

    const promo = input.promo === PROMO_CODE ? PROMO_CODE : null;

    const q = await db.transaction(async (tx) => {
        // Le bon de réduction n'est consommé que s'il existe, non utilisé, et que l'aller est certifié
        let useVoucher = false;
        if (input.useVoucher && canUseVoucher(aller)) {
            const mine = tx.select({ id: userItems.id }).from(userItems).where(and(eq(userItems.userId, user.id), eq(userItems.itemId, VOUCHER_ITEM_ID), isNull(userItems.usedAt))).limit(1);
            const claimed = await tx.update(userItems).set({ usedAt: new Date() }).where(inArray(userItems.id, mine)).returning({ id: userItems.id });
            useVoucher = claimed.length > 0;
        }
        const q = quote({ aller, retour, pack: !!input.pack, useVoucher, promo, passengers });

        for (const j of legs) {
            const seats = placesFor(j, passengers);
            const values = { journeyId: j.id, passengerId: user.id, seats, priceCents: Math.round(j.price * 100) * seats, status: "demande" as const, createdAt: new Date() };
            await tx.insert(bookings).values(values).onConflictDoUpdate({ target: [bookings.journeyId, bookings.passengerId], set: values });
        }
        if (q.pack) {
            const owned = tx.select({ id: userStories.storyId }).from(userStories).where(eq(userStories.userId, user.id));
            const packStories = await tx.select({ id: stories.id }).from(stories).where(and(inArray(stories.regionSlug, aller.regions), notInArray(stories.id, owned))).limit(PACK_SIZE);
            if (packStories.length) await tx.insert(userStories).values(packStories.map((s) => ({ userId: user.id, storyId: s.id, source: "achat" as const })));
        }
        return q;
    });

    refresh();
    return { ok: true, paid: q.payable };
}

// Annulation : sa réservation (passager) ou son trajet publié (conducteur)
export async function cancelTrip(id: string) {
    const user = await requireUser();
    if (!isUuid(id)) return;
    const mine = await db.update(bookings).set({ status: "annulee" }).where(and(eq(bookings.id, id), eq(bookings.passengerId, user.id))).returning({ id: bookings.id });
    if (!mine.length) await db.update(journeys).set({ cancelledAt: new Date() }).where(and(eq(journeys.id, id), eq(journeys.driverId, user.id)));
    refresh();
}

// Réponse du conducteur à une demande de place
export async function answerRequest(bookingId: string, accept: boolean) {
    const user = await requireUser();
    if (!isUuid(bookingId)) return;
    const [row] = await db
        .select({ seats: bookings.seats, journeyId: journeys.id, total: journeys.seats })
        .from(bookings)
        .innerJoin(journeys, eq(journeys.id, bookings.journeyId))
        .where(and(eq(bookings.id, bookingId), eq(bookings.status, "demande"), eq(journeys.driverId, user.id)));
    if (!row) return;

    const [{ accepted }] = await db
        .select({ accepted: sql<number>`coalesce(sum(${bookings.seats}), 0)::int` })
        .from(bookings)
        .where(and(eq(bookings.journeyId, row.journeyId), eq(bookings.status, "acceptee")));
    const fits = accepted + row.seats <= row.total;
    await db.update(bookings).set({ status: accept && fits ? "acceptee" : "refusee" }).where(eq(bookings.id, bookingId));
    refresh();
}

export type PublishInput = { from: string; to: string; date: string; places: number };

// Publication d'un trajet conducteur depuis l'accueil
export async function publishJourney(input: PublishInput) {
    const user = await requireUser();
    const seats = intIn(input.places, 1, 8);
    if (!seats || !isIsoDate(input.date) || input.date < todayIso()) return { error: "Date ou nombre de places invalide." };

    const all = await db.select().from(cities);
    const from = all.find((c) => c.slug === citySlug(cityName(text(input.from, 200))));
    const to = all.find((c) => c.slug === citySlug(cityName(text(input.to, 200))));
    if (!from || !to || from.slug === to.slug) return { error: "Bluni ne dessert pas encore ces villes." };

    const km = roadKm(from, to);
    const departAt = parisDate(input.date, PUBLISH_TIME);
    const [created] = await db
        .insert(journeys)
        .values({
            driverId: user.id,
            fromCity: from.slug,
            fromSpot: "Centre-ville",
            fromAddress: `Centre-ville, ${from.name}`,
            toCity: to.slug,
            toSpot: "Centre-ville",
            toAddress: `Centre-ville, ${to.name}`,
            departAt,
            arriveAt: new Date(departAt.getTime() + travelMinutes(km) * 60_000),
            km,
            priceCents: estimatePrice(km) * 100,
            seats,
            certified: !!user.rulesAcceptedAt && !!(user.blablacarId || user.luniiId),
        })
        .returning({ id: journeys.id });

    refresh();
    return { ok: true, id: created.id, from: from.name, to: to.name, time: PUBLISH_TIME };
}
