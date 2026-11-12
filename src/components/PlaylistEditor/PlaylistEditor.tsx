"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import Button from "../Button/Button";
import CheckOption from "../CheckOption/CheckOption";
import EmptyState from "../EmptyState/EmptyState";
import SectionTitle from "../SectionTitle/SectionTitle";
import { useApp } from "../AppState/AppState";
import { playlistStoryIds, type PlaylistEntry } from "@/lib/playlists";
import { minutes } from "@/lib/stories";
import { savePlaylist } from "@/server/actions/playlists";
import styles from "./PlaylistEditor.module.css";

const key = (e: PlaylistEntry) => `${e.kind}:${e.id}`;

export default function PlaylistEditor({ journeyId }: { journeyId: string }) {
    const { state, catalog, play } = useApp();
    const router = useRouter();
    const [pending, start] = useTransition();
    const trip = state.trips.find((t) => t.journey.id === journeyId && t.status === "a-venir");
    const [entries, setEntries] = useState<PlaylistEntry[]>(() => state.playlists.find((p) => p.journeyId === journeyId)?.entries ?? []);
    const [error, setError] = useState("");

    if (!trip) return <EmptyState title="Trajet introuvable" text="Ce trajet n’est plus à venir." action={{ label: "Retour à la bibliothèque", href: "/histoires/bibliotheque" }} />;

    const ownedIds = [...new Set([...state.ownedStories, ...state.gifts])];
    const library = ownedIds.map(catalog.storyById).filter((s) => !!s);
    const collections = catalog.regions.filter((r) => library.some((s) => s.regionSlug === r.slug));
    const selected = new Set(entries.map(key));
    const ids = playlistStoryIds(entries, ownedIds, catalog.stories);
    const total = ids.reduce((n, id) => n + (catalog.storyById(id)?.durationSec ?? 0), 0);

    const toggle = (e: PlaylistEntry, on: boolean) => setEntries((list) => (on ? [...list, e] : list.filter((x) => key(x) !== key(e))));
    const save = () =>
        start(async () => {
            const result = await savePlaylist(journeyId, entries);
            if (result.ok) router.push("/histoires/bibliotheque");
            else setError(result.error ?? "");
        });
    const listen = () => {
        play(ids[0], ids);
        router.push("/histoires");
    };

    return (
        <div className={styles.root}>
            <p className={styles.trip}>{trip.from} → {trip.to} · {trip.day} · {trip.time}</p>
            <p className={styles.summary}>{ids.length} histoire{ids.length > 1 ? "s" : ""} · {minutes(total)} d’écoute</p>

            {library.length === 0 ? (
                <EmptyState title="Ta bibliothèque est vide" text="Ajoute des histoires depuis la boutique pour préparer ton trajet." action={{ label: "Voir la boutique", href: "/histoires/boutique" }} />
            ) : (
                <>
                    <SectionTitle title="Collections" subtitle="Toutes les histoires de la région, y compris celles ajoutées plus tard" />
                    {collections.map((r) => (
                        <CheckOption key={r.slug} label={`${r.name} (${library.filter((s) => s.regionSlug === r.slug).length})`} checked={selected.has(`collection:${r.slug}`)} onChange={(on) => toggle({ kind: "collection", id: r.slug }, on)} />
                    ))}
                    <SectionTitle title="Histoires" />
                    {library.map((s) => (
                        <CheckOption key={s.id} label={`${s.title} · ${minutes(s.durationSec)}`} checked={selected.has(`story:${s.id}`)} onChange={(on) => toggle({ kind: "story", id: s.id }, on)} />
                    ))}
                    {error && <p role="alert" className={styles.error}>{error}</p>}
                    <div className={styles.actions}>
                        {ids.length > 0 && <Button label="Écouter la playlist" icon={Play} type="secondary" onClick={listen} />}
                        <Button label={pending ? "Enregistrement…" : "Enregistrer"} type={pending ? "deactivated" : "primary"} onClick={save} />
                    </div>
                </>
            )}
        </div>
    );
}
