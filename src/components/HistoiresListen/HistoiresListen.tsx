"use client";

import { useCallback, useState } from "react";
import StoryPlayer from "../StoryPlayer/StoryPlayer";
import EmptyState from "../EmptyState/EmptyState";
import { useApp } from "../AppState/AppState";
import SectionTitle from "../SectionTitle/SectionTitle";
import Cover from "../Cover/Cover";
import { minutes, regionName, storyById, type Story } from "@/lib/stories";
import styles from "./HistoiresListen.module.css";

export default function HistoiresListen() {
    const { state, update } = useApp();
    const [autoPlay, setAutoPlay] = useState(false);
    const [run, setRun] = useState(0);

    const library = [...new Set([...state.ownedStories, ...state.gifts])].map(storyById).filter((s): s is Story => !!s);
    const current = (state.nowPlaying && storyById(state.nowPlaying)) || library[0];

    const play = (id: string) => {
        setAutoPlay(true);
        setRun((r) => r + 1);
        update((s) => ({ ...s, nowPlaying: id }));
    };

    const next = current && library[library.findIndex((s) => s.id === current.id) + 1];
    const currentId = current?.id;
    const nextId = next?.id;
    const onEnd = useCallback(() => {
        if (nextId) {
            setAutoPlay(true);
            update((s) => ({ ...s, nowPlaying: nextId }));
        } else setAutoPlay(false);
    }, [nextId, update]);

    return (
        <>
            {current && <StoryPlayer key={`${currentId}-${run}`} story={current} autoPlay={autoPlay} onEnd={onEnd} />}
            <section className={styles.library}>
                <SectionTitle title="Ma bibliothèque" subtitle={`${library.length} histoire${library.length > 1 ? "s" : ""}`} link={{ label: "Boutique", href: "/histoires/boutique" }} />
                {library.length === 0 ? (
                    <EmptyState title="Ta bibliothèque est vide" text="Ajoute des histoires depuis la boutique pour les écouter pendant le trajet." action={{ label: "Voir la boutique", href: "/histoires/boutique" }} />
                ) : (
                    <ul className={styles.list}>
                        {library.map((s) => (
                            <li key={s.id}>
                                <button type="button" className={`${styles.row} ${s.id === currentId ? styles.current : ""}`} onClick={() => play(s.id)} aria-label={`Écouter ${s.title}`}>
                                    <Cover regionSlug={s.regionSlug} className={styles.cover} />
                                    <span className={styles.texts}>
                                        <span className={styles.title}>{s.title}</span>
                                        <span className={styles.infos}>{regionName(s.regionSlug)} · {minutes(s.durationSec)}{state.gifts.includes(s.id) ? " · cadeau" : ""}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
