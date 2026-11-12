"use client";

import { useState } from "react";
import StoryPlayer from "../StoryPlayer/StoryPlayer";
import EmptyState from "../EmptyState/EmptyState";
import { useApp } from "../AppState/AppState";
import SectionTitle from "../SectionTitle/SectionTitle";
import Cover from "../Cover/Cover";
import { minutes, type Story } from "@/lib/stories";
import styles from "./HistoiresListen.module.css";

export default function HistoiresListen() {
    const { state, catalog, play: select } = useApp();
    const { storyById, regionName } = catalog;
    const [autoPlay, setAutoPlay] = useState(false);

    const library = [...new Set([...state.ownedStories, ...state.gifts])].map(storyById).filter((s): s is Story => !!s);
    const current = (state.nowPlaying && storyById(state.nowPlaying)) || library[0];
    // Une playlist lancée depuis la bibliothèque impose l'ordre de lecture
    const queue = current && state.queue?.includes(current.id) ? state.queue.map(storyById).filter((s): s is Story => !!s) : library;

    if (!current) {
        return <EmptyState title="Rien à écouter" text="Ajoute des histoires depuis la boutique pour les écouter pendant le trajet." action={{ label: "Voir la boutique", href: "/histoires/boutique" }} />;
    }

    const next = queue[queue.findIndex((s) => s.id === current.id) + 1];
    const play = (id: string) => {
        setAutoPlay(true);
        select(id, state.queue ?? undefined);
    };
    const onEnd = () => (next ? play(next.id) : setAutoPlay(false));

    return (
        <>
            <StoryPlayer key={current.id} story={current} autoPlay={autoPlay} onEnd={onEnd} />
            {next && (
                <section className={styles.next}>
                    <SectionTitle title="À suivre" />
                    <button type="button" className={styles.row} onClick={() => play(next.id)} aria-label={`Écouter ${next.title}`}>
                        <Cover regionSlug={next.regionSlug} className={styles.cover} />
                        <span className={styles.texts}>
                            <span className={styles.title}>{next.title}</span>
                            <span className={styles.infos}>{regionName(next.regionSlug)} · {minutes(next.durationSec)}</span>
                        </span>
                    </button>
                </section>
            )}
        </>
    );
}
