"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Pause, Play, RotateCcw } from "lucide-react";
import { clock } from "@/lib/anecdotes";
import { nextTrip } from "@/lib/trips";
import { useApp } from "../AppState/AppState";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import { useRaconter } from "../RaconterProvider/RaconterProvider";
import Waveform from "../Waveform/Waveform";
import styles from "./RecorderStep.module.css";

const MIN_SEC = 3;
// Environ 2,4 Mo à 32 kbit/s : sous la limite d'envoi du serveur
const MAX_SEC = 600;

export default function RecorderStep() {
    const router = useRouter();
    const { draft, patch, clear, setCreated, mic } = useRaconter();
    const { state, catalog } = useApp();
    const trip = nextTrip(state.trips, state.profile.role) ?? state.trips.find((t) => t.status === "termine");
    const crossed = trip?.journey.regions ?? [];
    const region = crossed.length ? catalog.regionName(crossed[Math.floor(crossed.length / 2)]) : null;
    // retour depuis l'étape suivante : l'enregistreur est encore là, on reprend en pause à la durée atteinte
    const [resumed] = useState(() => mic.live());
    const [elapsed, setElapsed] = useState(() => (resumed ? draft.durationSec : 0));
    // prêt : écran affiché, rien n'est lancé tant qu'on n'a pas appuyé sur le démarrage
    const [phase, setPhase] = useState<"ready" | "recording" | "paused">(resumed ? "paused" : "ready");
    const recording = phase === "recording";
    const [error, setError] = useState<string | null>(null);
    // demande d'accès au micro ou fichier en cours de finalisation : on bloque les boutons
    const [busy, setBusy] = useState(false);

    // À chaque affichage de l'écran, y compris réaffiché depuis le cache de navigation : boutons débloqués,
    // reprise en pause si l'enregistreur est encore là, sinon nouvel enregistrement sur un brouillon vide
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        setBusy(false);
        setError(null);
        if (mic.live()) {
            setPhase("paused");
            setElapsed(draft.durationSec);
        } else {
            clear();
            setCreated(null);
            setPhase("ready");
            setElapsed(0);
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!recording) return;
        const id = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [recording]);

    const begin = async () => {
        setError(null);
        setBusy(true);
        const failure = await mic.start();
        setBusy(false);
        if (failure) return setError(failure);
        setPhase("recording");
    };

    const togglePause = () => {
        if (recording) mic.pause();
        else mic.resume();
        setPhase(recording ? "paused" : "recording");
    };

    const finish = async (seconds = elapsed) => {
        if (seconds < MIN_SEC) {
            setError(`Ton enregistrement est trop court : encore ${MIN_SEC - seconds} s minimum.`);
            return;
        }
        setBusy(true);
        mic.pause();
        setPhase("paused");
        const audio = await mic.snapshot();
        if (!audio?.size) {
            setBusy(false);
            setError("L’enregistrement n’a rien capté. Réessaie.");
            return;
        }
        patch({ durationSec: seconds, audio });
        router.push("/raconter/contexte", { transitionTypes: ["nav-forward"] });
    };

    // Durée maximale atteinte : l'enregistrement se termine tout seul
    useEffect(() => {
        if (!recording) return;
        const id = setTimeout(() => void finish(MAX_SEC), Math.max(MAX_SEC - elapsed, 0) * 1000);
        return () => clearTimeout(id);
    }, [recording]); // eslint-disable-line react-hooks/exhaustive-deps

    const ready = phase === "ready";
    const toggle = { ready: { label: "Pause", Icon: Pause }, recording: { label: "Pause", Icon: Pause }, paused: { label: "Reprendre", Icon: Play } }[phase];

    const restart = () => {
        mic.discard();
        setElapsed(0);
        setPhase("ready");
        setError(null);
    };

    return (
        <FlowPage>
            <FlowHeader title="Raconter" backHref="/raconter" step={1} steps={4} />

            {region && (
                <p className={styles.region}>
                    <MapPin size={16} />
                    Tu traverses la région {region}
                </p>
            )}

            <div className={styles.idea}>
                <Image src="/images/mascottes/idee.webp" alt="" width={61} height={64} />
                <div>
                    <p className={styles.ideaTitle}>Une idée ?</p>
                    <p className={styles.ideaText}>Une légende, un souvenir, un lieu que tu vois par la fenêtre…</p>
                </div>
            </div>

            <section className={styles.recording}>
                <p className={`${styles.status} ${recording ? "" : styles.statusIdle}`} role="status">
                    <span className={styles.dot} />
                    {{ ready: "Prêt à enregistrer", recording: "Enregistrement en cours", paused: "En pause" }[phase]}
                </p>
                <p className={styles.timer} aria-label={`Durée ${clock(elapsed)}`}>{clock(elapsed)}</p>
                <Waveform animated={recording} colorful progress={{ ready: 0, recording: 1, paused: 0.75 }[phase]} />
            </section>

            <div className={styles.controls}>
                <div className={styles.control}>
                    <button type="button" className={styles.side} onClick={restart} disabled={busy || (elapsed === 0 && ready)} aria-label="Recommencer">
                        <RotateCcw size={24} />
                    </button>
                    <span>Recommencer</span>
                </div>
                <div className={`${styles.control} ${styles.main}`}>
                    {ready ? (
                        <button type="button" className={styles.stop} onClick={begin} disabled={busy} aria-label="Démarrer l’enregistrement">
                            <Play size={32} fill="currentColor" />
                        </button>
                    ) : (
                        <button type="button" className={styles.stop} onClick={() => finish()} disabled={busy} aria-label="Terminer l’enregistrement">
                            <span />
                        </button>
                    )}
                    <span>{ready ? "Démarrer" : "Terminer"}</span>
                </div>
                <div className={styles.control}>
                    <button type="button" className={styles.side} onClick={togglePause} disabled={ready || busy} aria-label={toggle.label}>
                        <toggle.Icon size={24} fill="currentColor" />
                    </button>
                    <span>{toggle.label}</span>
                </div>
            </div>

            {error
                ? <p className={styles.error} role="alert">{error}</p>
                : <p className={styles.hint}>{ready ? "Appuie sur le bouton pour commencer à raconter." : "Appuie sur le carré quand ton histoire est terminée."}</p>}
        </FlowPage>
    );
}
