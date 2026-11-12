"use client";

import { Pause, Play } from "lucide-react";
import { clock } from "@/lib/anecdotes";
import Waveform from "../Waveform/Waveform";
import styles from "./AudioPlayerMini.module.css";
import { usePlayer } from "./usePlayer";

type AudioPlayerMiniProps = {
    durationSec: number;
    // card : encadré avec onde ; round : simple bouton rond
    variant?: "card" | "round";
    size?: number;
    label?: string;
    src?: string | null;
}

export default function AudioPlayerMini({ durationSec, variant = "card", size = 40, label = "Écouter l’enregistrement", src }: AudioPlayerMiniProps) {
    const player = usePlayer(durationSec, src);
    const Icon = player.playing ? Pause : Play;
    const aria = player.playing ? "Mettre en pause" : label;

    if (variant === "round") {
        return (
            <button type="button" className={styles.round} style={{ width: size, height: size, borderRadius: size / 2 }} onClick={player.toggle} aria-label={aria}>
                <Icon size={Math.round(size * 0.4)} fill="currentColor" />
            </button>
        );
    }

    return (
        <div className={styles.card}>
            <button type="button" className={styles.play} onClick={player.toggle} aria-label={aria}>
                <Icon size={16} fill="currentColor" />
            </button>
            <Waveform progress={player.progress} height={36} />
            <span className={styles.time}>{clock(player.playing || player.pos > 0 ? player.pos : durationSec)}</span>
        </div>
    );
}
