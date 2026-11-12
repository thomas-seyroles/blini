"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "../Button/Button";
import EmptyState from "../EmptyState/EmptyState";
import { useApp } from "../AppState/AppState";
import SectionTitle from "../SectionTitle/SectionTitle";
import TripRow from "../TripRow/TripRow";
import Cover from "../Cover/Cover";
import { playlistStoryIds } from "@/lib/playlists";
import { STORIES_PER_REGION, minutes, ownedInRegion, type Story } from "@/lib/stories";
import { sortTrips } from "@/lib/trips";
import styles from "./HistoiresLibrary.module.css";

export default function HistoiresLibrary() {
    const { state, catalog, play } = useApp();
    const { storyById, regionName } = catalog;
    const router = useRouter();
    const [picking, setPicking] = useState(false);
    const [tab, setTab] = useState<"histoires" | "collections">("histoires");

    const library = [...new Set([...state.ownedStories, ...state.gifts])].map(storyById).filter((s): s is Story => !!s);
    const currentId = state.nowPlaying;

    const listen = (id: string) => {
        play(id);
        router.push("/histoires");
    };

    // Collections : régions dont on possède au moins une histoire ou dont on a le badge
    const collections = catalog.regions
        .map((r) => ({ region: r, owned: ownedInRegion(r.slug, library.map((s) => s.id), catalog.stories), badge: state.badges.includes(r.slug) }))
        .filter((c) => c.owned > 0 || c.badge);
    const upcoming = sortTrips(state.trips.filter((t) => t.status === "a-venir"), "a-venir");
    const ownedIds = library.map((s) => s.id);
    const entriesOf = (journeyId: string) => state.playlists.find((p) => p.journeyId === journeyId)?.entries;
    const withList = upcoming.filter((t) => entriesOf(t.journey.id));
    const without = upcoming.filter((t) => !entriesOf(t.journey.id));
    const row = (t: (typeof upcoming)[number]) => {
        const entries = entriesOf(t.journey.id);
        const count = entries ? playlistStoryIds(entries, ownedIds, catalog.stories).length : 0;
        return <TripRow key={t.id} route={`${t.from} → ${t.to}`} meta={`${t.day} · ${t.time}`} badge={entries ? `${count} histoire${count > 1 ? "s" : ""}` : "Créer"} href={`/histoires/bibliotheque/trajet/${t.journey.id}`} />;
    };

    return (
        <>
        <section className={styles.library}>
            <SectionTitle title="Mes playlists" subtitle="Préparer mes histoires, une playlist par trajet" />
            {withList.length > 0 && <ul className={styles.list}>{withList.map(row)}</ul>}
            {without.length > 0 ? (
                <>
                    <Button label="Nouvelle playlist" icon={Plus} type="secondary" onClick={() => setPicking(!picking)} />
                    {picking && (
                        <>
                            <p className={styles.infos}>Pour quel trajet ?</p>
                            <ul className={styles.list}>{without.map(row)}</ul>
                        </>
                    )}
                </>
            ) : upcoming.length === 0 ? (
                <>
                    <p className={styles.infos}>Une playlist se rattache à un trajet à venir. Réserve ou publie un trajet pour préparer tes histoires.</p>
                    <Button label="Trouver un trajet" link="/" type="secondary" />
                </>
            ) : null}
        </section>
        <section className={styles.library}>
            <SectionTitle title="Ma bibliothèque" subtitle={`${library.length} histoire${library.length > 1 ? "s" : ""} · ${collections.length} collection${collections.length > 1 ? "s" : ""}`} link={{ label: "Boutique", href: "/histoires/boutique" }} />
            <div className={styles.tabs} role="tablist" aria-label="Contenu de la bibliothèque">
                {(["histoires", "collections"] as const).map((t) => (
                    <button key={t} type="button" role="tab" aria-selected={tab === t} className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`} onClick={() => setTab(t)}>
                        {t === "histoires" ? "Histoires" : "Collections"}
                    </button>
                ))}
            </div>
            {library.length === 0 ? (
                <EmptyState title="Ta bibliothèque est vide" text="Ajoute des histoires depuis la boutique pour les écouter pendant le trajet." action={{ label: "Voir la boutique", href: "/histoires/boutique" }} />
            ) : tab === "histoires" ? (
                <ul className={styles.list}>
                    {library.map((s) => (
                        <li key={s.id}>
                            <button type="button" className={`${styles.row} ${s.id === currentId ? styles.current : ""}`} onClick={() => listen(s.id)} aria-label={`Écouter ${s.title}`}>
                                <Cover regionSlug={s.regionSlug} className={styles.cover} />
                                <span className={styles.texts}>
                                    <span className={styles.title}>{s.title}</span>
                                    <span className={styles.infos}>{regionName(s.regionSlug)} · {minutes(s.durationSec)}{state.gifts.includes(s.id) ? " · cadeau" : ""}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className={styles.list}>
                    {collections.map(({ region, owned, badge }) => (
                        <li key={region.slug}>
                            <Link href={`/histoires/region/${region.slug}`} transitionTypes={["nav-forward"]} className={styles.row}>
                                <Cover regionSlug={region.slug} className={styles.cover} />
                                <span className={styles.texts}>
                                    <span className={styles.title}>{region.name}</span>
                                    <span className={styles.infos}>{owned} / {STORIES_PER_REGION} histoires{badge ? " · badge obtenu" : ""}</span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
        </>
    );
}
