"use server";

import { and, eq, inArray, ne, or } from "drizzle-orm";
import { refresh } from "next/cache";
import { MAX_PLAYLIST_ENTRIES, type PlaylistEntry } from "@/lib/playlists";
import { requireUser } from "../auth";
import { db } from "../db";
import { bookings, journeys, playlistEntries, playlists, regions, userStories } from "../db/schema";

// Remplace la playlist du compte pour un trajet à venir. Une liste vide la supprime.
export async function savePlaylist(journeyId: string, entries: PlaylistEntry[]): Promise<{ ok?: boolean; error?: string }> {
    const user = await requireUser();
    if (typeof journeyId !== "string" || !Array.isArray(entries) || entries.length > MAX_PLAYLIST_ENTRIES) return { error: "Playlist invalide." };
    if (entries.some((e) => (e?.kind !== "story" && e?.kind !== "collection") || typeof e.id !== "string")) return { error: "Playlist invalide." };

    const [journey] = await db
        .select({ id: journeys.id })
        .from(journeys)
        .leftJoin(bookings, and(eq(bookings.journeyId, journeys.id), eq(bookings.passengerId, user.id), ne(bookings.status, "annulee"), ne(bookings.status, "refusee")))
        .where(and(eq(journeys.id, journeyId), or(eq(journeys.driverId, user.id), eq(bookings.passengerId, user.id))));
    if (!journey) return { error: "Ce trajet n’est pas dans ton compte." };

    const storyIds = entries.filter((e) => e.kind === "story").map((e) => e.id);
    const regionSlugs = entries.filter((e) => e.kind === "collection").map((e) => e.id);
    const [ownedRows, regionRows] = await Promise.all([
        storyIds.length ? db.select({ id: userStories.storyId }).from(userStories).where(and(eq(userStories.userId, user.id), inArray(userStories.storyId, storyIds))) : [],
        regionSlugs.length ? db.select({ slug: regions.slug }).from(regions).where(inArray(regions.slug, regionSlugs)) : [],
    ]);
    if (ownedRows.length !== new Set(storyIds).size || regionRows.length !== new Set(regionSlugs).size) return { error: "Une histoire ou une collection n’est pas disponible." };

    await db.transaction(async (tx) => {
        await tx.delete(playlists).where(and(eq(playlists.userId, user.id), eq(playlists.journeyId, journeyId)));
        if (!entries.length) return;
        const [{ id }] = await tx.insert(playlists).values({ userId: user.id, journeyId }).returning({ id: playlists.id });
        await tx.insert(playlistEntries).values(
            entries.map((e, position) => ({ playlistId: id, position, storyId: e.kind === "story" ? e.id : null, regionSlug: e.kind === "collection" ? e.id : null })),
        );
    });
    refresh();
    return { ok: true };
}
