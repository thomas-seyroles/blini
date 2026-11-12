import type { Story } from "./stories";

// Une entrée de playlist : une histoire choisie ou une collection (id = slug de la région)
export type PlaylistEntry = { kind: "story" | "collection"; id: string };
export type Playlist = { journeyId: string; entries: PlaylistEntry[] };

export const MAX_PLAYLIST_ENTRIES = 60;

// Histoires lues dans l'ordre, doublons retirés, limitées à celles de la bibliothèque
export function playlistStoryIds(entries: PlaylistEntry[], ownedIds: string[], stories: Story[]) {
    const owned = new Set(ownedIds);
    const ids = entries.flatMap((e) => (e.kind === "story" ? [e.id] : stories.filter((s) => s.regionSlug === e.id).map((s) => s.id)));
    return [...new Set(ids)].filter((id) => owned.has(id));
}
