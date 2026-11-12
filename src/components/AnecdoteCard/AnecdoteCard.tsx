"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import { clock, regionOf, type Anecdote } from "@/lib/anecdotes";
import { useApp } from "../AppState/AppState";
import { useSimulatedPlayer } from "../AudioPlayerMini/useSimulatedPlayer";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import DetailsEditor from "../DetailsEditor/DetailsEditor";
import StatusSteps from "../StatusSteps/StatusSteps";
import styles from "./AnecdoteCard.module.css";

export default function AnecdoteCard({ anecdote: a }: { anecdote: Anecdote }) {
    const { updateAnecdote, deleteAnecdote } = useApp();
    const player = useSimulatedPlayer(a.audioSec);
    const [editing, setEditing] = useState(false);
    const [confirming, setConfirming] = useState(false);

    return (
        <article className={styles.root}>
            <div className={styles.top}>
                <div className={styles.titles}>
                    <Link href={`/raconter/anecdotes/${a.id}`} transitionTypes={["nav-forward"]} className={styles.title}>{a.title}</Link>
                    <p className={styles.sub}>{regionOf(a.place)} · audio {clock(a.audioSec).replace(/^0/, "")}{a.hasPhoto && " + photo"}</p>
                </div>
                <span className={styles.points}>
                    +{a.points} pts
                    <Image src="/images/icone-points.svg" alt="" width={15} height={15} />
                </span>
            </div>

            {a.validated === false && <p className={styles.waiting}>À valider en fin de trajet</p>}

            <StatusSteps variant="compact" status={a.status} />

            {(player.playing || player.pos > 0) && (
                <div className={styles.progress} role="progressbar" aria-label="Lecture" aria-valuemin={0} aria-valuemax={a.audioSec} aria-valuenow={Math.round(player.pos)}>
                    <span style={{ width: `${player.progress * 100}%` }} />
                </div>
            )}

            {editing ? (
                <DetailsEditor
                    initial={a.details}
                    onSave={(details) => { updateAnecdote(a.id, { details }); setEditing(false); }}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <div className={styles.actions}>
                    <button type="button" className={styles.listen} onClick={player.toggle}>
                        {player.playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                        {player.playing ? "Pause" : "Écouter"}
                    </button>
                    <button type="button" className={styles.details} onClick={() => setEditing(true)}>
                        <Pencil size={15} />
                        {a.details ? "Modifier les détails" : "Ajouter des détails écrits"}
                    </button>
                    <button type="button" className={styles.remove} onClick={() => setConfirming(true)} aria-label={`Supprimer ${a.title}`}>
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={confirming}
                title="Supprimer cette anecdote ?"
                text={`« ${a.title} » sera définitivement supprimée.`}
                confirmLabel="Supprimer"
                danger
                onConfirm={() => deleteAnecdote(a.id)}
                onCancel={() => setConfirming(false)}
            />
        </article>
    );
}
