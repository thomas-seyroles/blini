"use server";

import { and, desc, eq, gt, inArray, lt, or, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { requireUser } from "../auth";
import { db } from "../db";
import { anecdotes, bookings, journeys, regions } from "../db/schema";
import { isUuid, text } from "../validate";

const MAX_PHOTO = 900_000;
const MAX_AUDIO = 8_000_000;
const RECENT = 2 * 24 * 3600_000;

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Trajet en cours ou tout juste terminé auquel rattacher l'anecdote
async function currentJourney(userId: string) {
    const [row] = await db
        .select({ id: journeys.id })
        .from(journeys)
        .leftJoin(bookings, and(eq(bookings.journeyId, journeys.id), eq(bookings.passengerId, userId), eq(bookings.status, "acceptee")))
        .where(and(or(eq(journeys.driverId, userId), sql`${bookings.id} is not null`), lt(journeys.departAt, new Date()), gt(journeys.arriveAt, new Date(Date.now() - RECENT))))
        .orderBy(desc(journeys.departAt))
        .limit(1);
    return row?.id ?? null;
}

export async function createAnecdote(form: FormData) {
    const user = await requireUser();
    const title = text(form.get("title"), 80);
    const place = text(form.get("place"), 80);
    const details = text(form.get("details"), 500);
    const audioSec = Number(form.get("audioSec"));
    const photo = form.get("photo");
    const audio = form.get("audio");
    if (!title || place.length < 2 || !Number.isInteger(audioSec) || audioSec < 3 || audioSec > 3600) return { error: "Anecdote incomplète." };
    if (audio instanceof File && audio.size && (audio.size > MAX_AUDIO || !audio.type.startsWith("audio/"))) return { error: "Enregistrement trop lourd." };
    if (photo instanceof File && (photo.size > MAX_PHOTO || !photo.type.startsWith("image/"))) return { error: "Photo trop lourde." };

    const region = (await db.select().from(regions)).find((r) => norm(place).includes(norm(r.name)));
    const [created] = await db
        .insert(anecdotes)
        .values({
            userId: user.id,
            journeyId: await currentJourney(user.id),
            regionSlug: region?.slug ?? null,
            title,
            place,
            details,
            audioSec,
            audio: audio instanceof File && audio.size ? Buffer.from(await audio.arrayBuffer()) : null,
            audioType: audio instanceof File && audio.size ? audio.type.split(";")[0] : null,
            photo: photo instanceof File && photo.size ? Buffer.from(await photo.arrayBuffer()) : null,
        })
        .returning({ id: anecdotes.id, title: anecdotes.title });

    refresh();
    return { ok: true, id: created.id, title: created.title };
}

export async function updateAnecdoteDetails(id: string, details: string) {
    const user = await requireUser();
    if (!isUuid(id)) return;
    await db.update(anecdotes).set({ details: text(details, 500) }).where(and(eq(anecdotes.id, id), eq(anecdotes.userId, user.id)));
    refresh();
}

export async function deleteAnecdote(id: string) {
    const user = await requireUser();
    if (!isUuid(id)) return;
    await db.delete(anecdotes).where(and(eq(anecdotes.id, id), eq(anecdotes.userId, user.id)));
    refresh();
}

// Consentement des passagers recueilli : l'anecdote part en écoute chez Lunii
export async function validateAnecdotes(ids: string[]) {
    const user = await requireUser();
    const valid = Array.isArray(ids) ? ids.filter(isUuid) : [];
    if (!valid.length) return { count: 0 };
    const done = await db
        .update(anecdotes)
        .set({ validatedAt: new Date(), status: sql`greatest(${anecdotes.status}, 1)` })
        .where(and(inArray(anecdotes.id, valid), eq(anecdotes.userId, user.id), sql`${anecdotes.validatedAt} is null`))
        .returning({ id: anecdotes.id });
    refresh();
    return { count: done.length };
}
