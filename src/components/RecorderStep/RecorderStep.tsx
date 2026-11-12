"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Pause, Play, RotateCcw } from "lucide-react";
import { clock } from "@/lib/anecdotes";
import { regionBySlug } from "@/lib/stories";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import { useRaconter } from "../RaconterProvider/RaconterProvider";
import Waveform from "../Waveform/Waveform";
import styles from "./RecorderStep.module.css";

const MIN_SEC = 3;
const region = regionBySlug("bourgogne-franche-comte")?.name ?? "";

export default function RecorderStep() {
    const router = useRouter();
    const { patch, clear, setCreated } = useRaconter();
    const [elapsed, setElapsed] = useState(0);
    const [paused, setPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Nouvel enregistrement : on repart d'un brouillon vide
    useEffect(() => { clear(); setCreated(null); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [paused]);

    const finish = () => {
        if (elapsed < MIN_SEC) {
            setError(`Ton enregistrement est trop court : encore ${MIN_SEC - elapsed} s minimum.`);
            return;
        }
        patch({ durationSec: elapsed });
        router.push("/raconter/contexte", { transitionTypes: ["nav-forward"] });
    };

    const restart = () => {
        setElapsed(0);
        setPaused(false);
        setError(null);
    };

    return (
        <FlowPage>
            <FlowHeader title="Raconter" backHref="/raconter" step={1} steps={4} />

            <p className={styles.region}>
                <MapPin size={16} />
                Tu traverses la {region}
            </p>

            <div className={styles.idea}>
                <Image src="/images/raconter/mascotte-idee.png" alt="" width={61} height={64} />
                <div>
                    <p className={styles.ideaTitle}>Une idée ?</p>
                    <p className={styles.ideaText}>Une légende, un souvenir, un lieu que tu vois par la fenêtre…</p>
                </div>
            </div>

            <section className={styles.recording}>
                <p className={`${styles.status} ${paused ? styles.statusPaused : ""}`} role="status">
                    <span className={styles.dot} />
                    {paused ? "En pause" : "Enregistrement en cours"}
                </p>
                <p className={styles.timer} aria-label={`Durée ${clock(elapsed)}`}>{clock(elapsed)}</p>
                <Waveform animated={!paused} colorful progress={paused ? 0.75 : 1} />
            </section>

            <div className={styles.controls}>
                <div className={styles.control}>
                    <button type="button" className={styles.side} onClick={restart} aria-label="Recommencer">
                        <RotateCcw size={24} />
                    </button>
                    <span>Recommencer</span>
                </div>
                <div className={`${styles.control} ${styles.main}`}>
                    <button type="button" className={styles.stop} onClick={finish} aria-label="Terminer l’enregistrement">
                        <span />
                    </button>
                    <span>Terminer</span>
                </div>
                <div className={styles.control}>
                    <button type="button" className={styles.side} onClick={() => setPaused((p) => !p)} aria-label={paused ? "Reprendre" : "Pause"}>
                        {paused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                    </button>
                    <span>{paused ? "Reprendre" : "Pause"}</span>
                </div>
            </div>

            {error
                ? <p className={styles.error} role="alert">{error}</p>
                : <p className={styles.hint}>Appuie sur le carré quand ton histoire est terminée.</p>}
        </FlowPage>
    );
}
