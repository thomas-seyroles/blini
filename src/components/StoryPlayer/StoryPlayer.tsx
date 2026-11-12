"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, Moon, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import Cover from "../Cover/Cover";
import { useApp } from "../AppState/AppState";
import { duration, type Story } from "@/lib/stories";
import styles from "./StoryPlayer.module.css";

const SPEEDS = [1, 1.25, 1.5, 0.75];
const SLEEPS = [0, 5, 10, 15];

type StoryPlayerProps = { story: Story; autoPlay: boolean; onEnd: () => void };

// Lecteur simulé : la progression vient d'un timer, pas d'un fichier audio. Remonté (key) à chaque histoire.
export default function StoryPlayer({ story, autoPlay, onEnd }: StoryPlayerProps) {
    const { state, update } = useApp();
    const [pos, setPos] = useState(0);
    const [playing, setPlaying] = useState(autoPlay);
    const [speed, setSpeed] = useState(1);
    const [sleepMin, setSleepMin] = useState(0);
    const [sleepLeft, setSleepLeft] = useState(0);
    const total = story.durationSec;
    const favKey = `favori-${story.id}`;
    const fav = state.settings[favKey] === true;

    useEffect(() => {
        if (!playing) return;
        const timer = setInterval(() => {
            setPos((p) => Math.min(total, p + speed));
            setSleepLeft((l) => (l > 0 ? l - 1 : l));
        }, 1000);
        return () => clearInterval(timer);
    }, [playing, speed, total]);

    useEffect(() => {
        if (pos >= total) {
            setPlaying(false);
            setPos(0);
            onEnd();
        }
    }, [pos, total, onEnd]);

    useEffect(() => {
        if (sleepMin > 0 && sleepLeft === 0) {
            setPlaying(false);
            setSleepMin(0);
        }
    }, [sleepMin, sleepLeft]);

    const seek = (v: number) => setPos(Math.max(0, Math.min(total, v)));
    const cycleSleep = () => {
        const next = SLEEPS[(SLEEPS.indexOf(sleepMin) + 1) % SLEEPS.length];
        setSleepMin(next);
        setSleepLeft(next * 60);
    };
    const toggleFav = () => update((s) => ({ ...s, settings: { ...s.settings, [favKey]: !fav } }));
    const elapsed = Math.floor(pos);
    const sleepLabel = sleepMin ? `${Math.ceil(sleepLeft / 60)} min` : "Minuteur";

    return (
        <section className={styles.root} aria-label="Lecteur">
            <div className={styles.cover}>
                <Cover regionSlug={story.regionSlug} className={styles.coverImage} sizes="250px" />
                <Image className={styles.logo} src="/images/logo-bluni-simple.png" alt="" width={44} height={50} />
            </div>
            <h2 className={styles.title}>{story.title}</h2>
            <p className={styles.meta}>{story.author} · {story.age}</p>

            <input
                className={styles.range}
                type="range"
                min={0}
                max={total}
                step={1}
                value={elapsed}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Position dans l’histoire"
                aria-valuetext={`${duration(elapsed)} sur ${duration(total)}`}
                style={{ "--progress": `${(pos / total) * 100}%` } as React.CSSProperties}
            />
            <div className={styles.times}>
                <span>{duration(elapsed)}</span>
                <span>−{duration(total - elapsed)}</span>
            </div>

            <div className={styles.transport}>
                <button type="button" className={styles.skip} onClick={() => seek(pos - 15)} aria-label="Reculer de 15 secondes">
                    <RotateCcw size={44} strokeWidth={1.8} />
                    <span>15</span>
                </button>
                <button type="button" className={styles.play} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Lecture"}>
                    {playing ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" />}
                </button>
                <button type="button" className={styles.skip} onClick={() => seek(pos + 15)} aria-label="Avancer de 15 secondes">
                    <RotateCw size={44} strokeWidth={1.8} />
                    <span>15</span>
                </button>
            </div>

            <div className={styles.controls}>
                <button type="button" className={`${styles.control} ${speed !== 1 ? styles.on : ""}`} onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])} aria-label={`Vitesse de lecture, ${speed}×`}>
                    <span className={styles.badge}>{speed}×</span>
                    Vitesse
                </button>
                <button type="button" className={`${styles.control} ${sleepMin ? styles.on : ""}`} onClick={cycleSleep} aria-label={sleepMin ? `Minuteur de sommeil, ${sleepLabel} restantes` : "Minuteur de sommeil désactivé"}>
                    <span className={styles.badge}><Moon size={16} /></span>
                    {sleepLabel}
                </button>
                <button type="button" className={`${styles.control} ${fav ? styles.on : ""}`} onClick={toggleFav} aria-pressed={fav}>
                    <span className={styles.badge}><Heart size={16} fill={fav ? "currentColor" : "none"} /></span>
                    Favori
                </button>
            </div>
        </section>
    );
}
