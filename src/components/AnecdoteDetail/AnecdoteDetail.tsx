"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, MapPin, Pencil, Trash2 } from "lucide-react";
import { detailSteps, minSec } from "@/lib/anecdotes";
import { deleteAnecdote, updateAnecdoteDetails } from "@/server/actions/anecdotes";
import { useApp } from "../AppState/AppState";
import AudioPlayerMini from "../AudioPlayerMini/AudioPlayerMini";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import DetailsEditor from "../DetailsEditor/DetailsEditor";
import EmptyState from "../EmptyState/EmptyState";
import FlowHeader from "../FlowHeader/FlowHeader";
import FlowPage from "../FlowPage/FlowPage";
import flow from "../FlowPage/FlowPage.module.css";
import StatusSteps from "../StatusSteps/StatusSteps";
import styles from "./AnecdoteDetail.module.css";

export default function AnecdoteDetail({ id }: { id: string }) {
    const router = useRouter();
    const { state } = useApp();
    const [editing, setEditing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const a = state.anecdotes.find((x) => x.id === id);

    if (deleted) return <FlowPage><FlowHeader title="Mon anecdote" backHref="/raconter" /></FlowPage>;

    if (!a) {
        return (
            <FlowPage>
                <FlowHeader title="Mon anecdote" backHref="/raconter" />
                <EmptyState title="Anecdote introuvable" text="Cette anecdote n’existe pas ou a été supprimée." action={{ label: "Retour à mes anecdotes", href: "/raconter" }} />
            </FlowPage>
        );
    }

    return (
        <FlowPage>
            <FlowHeader title="Mon anecdote" backHref="/raconter" />

            <div className={styles.cover}>
                {a.photoUrl
                    ? <Image src={a.photoUrl} alt={`Photo de ${a.title}`} fill unoptimized sizes="390px" />
                    : <Image className={styles.fallback} src="/images/mascottes/livres.webp" alt="" width={110} height={110} />}
            </div>

            <div className={styles.intro}>
                <h2 className={styles.title}>{a.title}</h2>
                <p className={styles.place}><MapPin size={14} />{a.place} · {a.sentAt === "Aujourd’hui" ? "envoyée aujourd’hui" : `envoyée le ${a.sentAt}`}</p>
                {a.details && <p className={styles.details}>{a.details}</p>}
            </div>

            <AudioPlayerMini durationSec={a.audioSec} src={a.audioUrl} label={`Écouter, durée ${minSec(a.audioSec)}`} />

            <section className={`${flow.box} ${flow.boxYellow} ${styles.status}`}>
                <h3 className={styles.statusTitle}>Où en est ton anecdote</h3>
                <StatusSteps variant="detail" steps={detailSteps(a)} />
            </section>

            {a.status >= 3 && (
                <section className={styles.gift}>
                    <span className={styles.giftIcon}><Gift size={16} /></span>
                    <div>
                        <p className={styles.giftTitle}>Ton histoire te sera offerte</p>
                        <p className={styles.giftText}>Tu la recevras dans ta bibliothèque dès sa publication.</p>
                    </div>
                </section>
            )}

            {editing ? (
                <DetailsEditor
                    initial={a.details}
                    onSave={(details) => { updateAnecdoteDetails(a.id, details); setEditing(false); }}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <button type="button" className={styles.edit} onClick={() => setEditing(true)}>
                    <Pencil size={16} />
                    {a.details ? "Modifier les détails" : "Ajouter des détails écrits"}
                </button>
            )}
            <button type="button" className={styles.remove} onClick={() => setConfirming(true)}>
                <Trash2 size={16} />
                Supprimer l’anecdote
            </button>
            <Link href="/raconter" transitionTypes={["nav-back"]} className={flow.centerLink}>Retour à mes anecdotes</Link>

            <div className={styles.spacer} />

            <ConfirmDialog
                open={confirming}
                title="Supprimer cette anecdote ?"
                text={`« ${a.title} » sera définitivement supprimée.`}
                confirmLabel="Supprimer"
                danger
                onConfirm={() => {
                    setConfirming(false);
                    setDeleted(true);
                    deleteAnecdote(a.id);
                    router.replace("/raconter", { transitionTypes: ["nav-back"] });
                }}
                onCancel={() => setConfirming(false)}
            />
        </FlowPage>
    );
}
